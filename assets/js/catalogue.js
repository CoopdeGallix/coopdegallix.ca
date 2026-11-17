// Catalogue : recherche, liste d'achats (gardée dans le navigateur) et impression.
(function () {
  var racine = document.getElementById('catalogue');
  if (!racine) return;
  var T = JSON.parse(document.getElementById('catalogue-textes').textContent);
  var CLE = 'coop-gallix-liste';
  var cases = Array.prototype.slice.call(racine.querySelectorAll('input[type=checkbox][data-article]'));
  var sections = Array.prototype.slice.call(racine.querySelectorAll('details.cat'));
  var parId = {};
  var etat = { ids: [], libres: [] };

  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  cases.forEach(function (c) {
    var li = c.closest('li');
    var nom = li.querySelector('.pick__nom').textContent;
    var sec = c.closest('details');
    parId[c.value] = { c: c, li: li, nom: nom, cle: norm(nom), cat: sec.dataset.cat, sec: sec };
  });

  // ---- Mémoire -------------------------------------------------------------
  function lire() {
    try {
      var v = JSON.parse(localStorage.getItem(CLE) || '{}');
      etat.ids = (v.ids || []).filter(function (id) { return parId[id]; });
      etat.libres = (v.libres || []).filter(function (t) { return typeof t === 'string' && t; });
    } catch (e) {}
  }
  function ecrire() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {} }

  // ---- Liste ---------------------------------------------------------------
  var zone = document.getElementById('liste-contenu');
  var vide = document.getElementById('liste-vide');
  var compteurs = document.querySelectorAll('[data-liste-compte]');
  var actions = document.querySelectorAll('[data-liste-action]');

  function ligne(texte, retirer) {
    var li = document.createElement('li');
    var carre = document.createElement('span');
    carre.className = 'liste__case';
    carre.setAttribute('aria-hidden', 'true');
    var nom = document.createElement('span');
    nom.className = 'liste__nom';
    nom.textContent = texte;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'liste__retirer';
    b.setAttribute('aria-label', T.retirer + ' ' + texte);
    b.textContent = '×';
    b.addEventListener('click', retirer);
    li.appendChild(carre); li.appendChild(nom); li.appendChild(b);
    return li;
  }
  function groupe(titre, lignes) {
    var bloc = document.createElement('section');
    bloc.className = 'liste__groupe';
    var h = document.createElement('h3');
    h.textContent = titre;
    var ul = document.createElement('ul');
    lignes.forEach(function (l) { ul.appendChild(l); });
    bloc.appendChild(h); bloc.appendChild(ul);
    return bloc;
  }
  function dessiner() {
    zone.textContent = '';
    var choisis = {};
    etat.ids.forEach(function (id) { choisis[id] = true; });
    cases.forEach(function (c) { c.checked = !!choisis[c.value]; });

    sections.forEach(function (sec) {
      var lignes = etat.ids.filter(function (id) { return parId[id].cat === sec.dataset.cat; })
        .sort(function (a, b) { return parId[a].cle < parId[b].cle ? -1 : 1; })
        .map(function (id) { return ligne(parId[id].nom, function () { basculer(id, false); }); });
      var n = sec.querySelector('.cat__choisis');
      n.textContent = lignes.length ? lignes.length + ' ✓' : '';
      if (lignes.length) zone.appendChild(groupe(sec.querySelector('.cat__titre').textContent, lignes));
    });
    if (etat.libres.length) {
      zone.appendChild(groupe(T.autres, etat.libres.map(function (t, i) {
        return ligne(t, function () { etat.libres.splice(i, 1); ecrire(); dessiner(); });
      })));
    }
    var total = etat.ids.length + etat.libres.length;
    vide.hidden = total > 0;
    compteurs.forEach(function (el) { el.textContent = total; });
    actions.forEach(function (el) { el.disabled = total === 0; });
    document.body.classList.toggle('liste-pleine', total > 0);
  }
  function basculer(id, oui) {
    var i = etat.ids.indexOf(id);
    if (oui && i < 0) etat.ids.push(id);
    if (!oui && i >= 0) etat.ids.splice(i, 1);
    ecrire(); dessiner();
  }
  racine.addEventListener('change', function (e) {
    if (e.target.matches('input[data-article]')) basculer(e.target.value, e.target.checked);
  });

  document.getElementById('liste-ajout').addEventListener('submit', function (e) {
    e.preventDefault();
    var champ = e.target.querySelector('input');
    var t = champ.value.trim().slice(0, 80);
    if (t && etat.libres.indexOf(t) < 0) { etat.libres.push(t); ecrire(); dessiner(); }
    champ.value = '';
  });
  document.querySelectorAll('[data-liste-action="imprimer"]').forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });
  document.querySelectorAll('[data-liste-action="vider"]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (window.confirm(T.confirmer)) { etat = { ids: [], libres: [] }; ecrire(); dessiner(); }
    });
  });

  // ---- Recherche -----------------------------------------------------------
  var champ = document.getElementById('catalogue-recherche');
  var resume = document.getElementById('catalogue-resume');
  var aucun = document.getElementById('catalogue-aucun');
  var ouvertsAvant = null, minuterie;

  function filtrer() {
    var mots = norm(champ.value).split(/\s+/).filter(Boolean);
    var actif = mots.length > 0;
    if (actif && !ouvertsAvant) ouvertsAvant = sections.map(function (s) { return s.open; });
    var total = 0;
    var parSection = {};
    Object.keys(parId).forEach(function (id) {
      var a = parId[id];
      var ok = mots.every(function (m) { return a.cle.indexOf(m) >= 0; });
      a.li.hidden = !ok;
      if (ok) { total++; parSection[a.cat] = (parSection[a.cat] || 0) + 1; }
    });
    sections.forEach(function (s, i) {
      var n = parSection[s.dataset.cat] || 0;
      s.hidden = actif && n === 0;
      if (actif) s.open = n > 0 && total <= 400;
      else if (ouvertsAvant) s.open = ouvertsAvant[i];
    });
    if (!actif) ouvertsAvant = null;
    aucun.hidden = total > 0;
    resume.textContent = actif ? T.resultats.replace('%d', total) : '';
  }
  champ.addEventListener('input', function () { clearTimeout(minuterie); minuterie = setTimeout(filtrer, 120); });
  champ.form.addEventListener('submit', function (e) { e.preventDefault(); filtrer(); });

  document.getElementById('date-impression').textContent =
    new Date().toLocaleDateString(document.documentElement.lang || 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  function ouvrirAncre() {
    var id = decodeURIComponent(location.hash.slice(1));
    var sec = id && document.getElementById(id);
    if (sec && sec.matches('details.cat')) {
      sec.open = true;
      sec.scrollIntoView({ block: 'start' });
      sec.querySelector('summary').focus({ preventScroll: true });
    }
  }
  window.addEventListener('hashchange', ouvrirAncre);

  lire(); dessiner(); ouvrirAncre();
})();
