/* CIRIS website behaviour: photo parallax, the C-to-4D animation and the enquiry form.
   Everything degrades gracefully: without JavaScript the pages still read fully. */
(function () {
  'use strict';

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- Photo parallax ---------- */
  var heroImgs = document.querySelectorAll('.hero-img');
  if (heroImgs.length && !reduceMotion) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY || 0, 900);
        for (var i = 0; i < heroImgs.length; i++) {
          heroImgs[i].style.transform = 'translateY(' + (y * 0.4).toFixed(1) + 'px)';
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- C mark becomes the 4D model ---------- */
  var net = document.getElementById('net');
  if (net) {
    var q = function (id) { return document.getElementById(id); };
    var hub = q('hub'), gap = q('gap'), hubLabel = q('hub-label');
    var labels = net.querySelectorAll('.lbl');
    var nodes = [
      { el: q('n1'), sp: q('s1'), from: [126, 82], to: [140, 30.72] },
      { el: q('n2'), sp: q('s2'), from: [70, 50], to: [38.72, 48.58] },
      { el: q('n3'), sp: q('s3'), from: [70, 150], to: [38.72, 151.42] },
      { el: q('n4'), sp: q('s4'), from: [126, 118], to: [140, 169.28] }
    ];
    var clamp = function (x) { return x < 0 ? 0 : (x > 1 ? 1 : x); };
    var ease = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
    var lerp = function (a, b, m) { return a + (b - a) * m; };
    var raf = null;

    var draw = function (t) {
      var m = ease(clamp((t - 1200) / 1800));
      var lab = clamp((t - 2800) / 700).toFixed(2);
      var hx = lerp(20, 100, m);
      hub.setAttribute('cx', hx.toFixed(2));
      hub.setAttribute('r', lerp(12, 22, m).toFixed(2));
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var x = lerp(n.from[0], n.to[0], m).toFixed(2), y = lerp(n.from[1], n.to[1], m).toFixed(2);
        n.el.setAttribute('cx', x); n.el.setAttribute('cy', y);
        n.sp.setAttribute('x1', hx.toFixed(2)); n.sp.setAttribute('x2', x); n.sp.setAttribute('y2', y);
      }
      gap.style.opacity = clamp((t - 2200) / 700).toFixed(2);
      hubLabel.style.opacity = lab;
      for (var j = 0; j < labels.length; j++) labels[j].style.opacity = lab;
      if (t >= 3500) net.classList.add('done'); else net.classList.remove('done');
    };

    var play = function () {
      if (raf) cancelAnimationFrame(raf);
      var start = null;
      var tick = function (now) {
        if (start === null) start = now;
        var t = now - start;
        draw(t);
        raf = t < 3600 ? requestAnimationFrame(tick) : null;
      };
      raf = requestAnimationFrame(tick);
    };

    if (reduceMotion) {
      draw(99999);
    } else {
      draw(0);
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          for (var k = 0; k < entries.length; k++) {
            if (entries[k].isIntersecting) { play(); io.disconnect(); break; }
          }
        }, { threshold: 0.35 });
        io.observe(net);
      } else {
        play();
      }
    }
    var replay = q('replay');
    if (replay) replay.addEventListener('click', function () { if (reduceMotion) { draw(99999); } else { play(); } });
  }

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById('enquiry');
  if (form) {
    var link = document.getElementById('link');
    var trail = document.getElementById('trail');
    var youNode = document.getElementById('you-node');
    var caption = document.getElementById('link-caption');
    var status = document.getElementById('form-status');
    var thanks = document.getElementById('thanks');
    var greet = document.getElementById('thanks-name');
    var captions = [
      'Fill in the form and watch your line to us draw in.',
      'A good start. Keep going.',
      'Halfway there.',
      'Nearly connected.',
      'All set. Press send to join the conversation.'
    ];

    var setProgress = function (n, sent) {
      var p = sent ? 1 : n / 4;
      trail.style.strokeDashoffset = String(Math.round(100 - p * 100));
      youNode.style.fill = (n > 0 || sent) ? 'var(--accent)' : '#FFFFFF';
      caption.textContent = sent ? 'Connected. Your message has reached us.' : captions[n];
      link.classList.toggle('sent', !!sent);
    };

    var track = function () {
      var el = form.elements, n = 0;
      if (el.name.value.trim()) n++;
      if (el.email.value.trim()) n++;
      if (el.message.value.trim()) n++;
      if (el.consent.checked) n++;
      setProgress(n, false);
    };
    form.addEventListener('input', track);
    form.addEventListener('change', track);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var key = form.elements.access_key ? form.elements.access_key.value : '';
      if (!key || key.indexOf('YOUR_') === 0) {
        status.textContent = 'Sorry, the form is not connected yet. Please email us at info@cirisgroup.co.uk.';
        return;
      }
      var topics = [];
      var boxes = form.querySelectorAll('input[name="topic"]:checked');
      for (var i = 0; i < boxes.length; i++) topics.push(boxes[i].value);
      var data = new FormData(form);
      data.delete('topic');
      data.append('topics', topics.join(', ') || 'Not specified');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.firstElementChild.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.success !== false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error('failed');
          var first = form.elements.name.value.trim().split(/\s+/)[0];
          greet.textContent = first ? ', ' + first : '';
          form.hidden = true;
          thanks.hidden = false;
          thanks.focus();
          setProgress(4, true);
        })
        .catch(function () {
          status.textContent = 'Sorry, something went wrong sending your enquiry. Please try again or email us at info@cirisgroup.co.uk.';
        })
        .then(function () {
          btn.disabled = false;
          btn.firstElementChild.textContent = 'Send enquiry';
        });
    });

    var again = document.getElementById('send-another');
    if (again) again.addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      thanks.hidden = true;
      setProgress(0, false);
      form.elements.name.focus();
    });
  }
})();
