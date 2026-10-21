# CIRIS website

The public website for **CIRIS Limited** (Collaborative Intelligence Risk Insight Services), served at **cirisgroup.co.uk**.

It is a plain static site: HTML, one stylesheet, one small script. There is no build step, framework or database, and no cookies or tracking. Fonts and images are self-hosted.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home, including "How we work" (the 4D model and animation) |
| `services.html` | Services |
| `about.html` | Our story and the founding directors |
| `sustainability.html` | Environment, ethics and sustainability (tree pledge) |
| `contact.html` | Enquiry form and contact details |
| `privacy.html` | Privacy notice and cookies (draft, for director review) |
| `accessibility.html` | Accessibility statement (draft, for director review) |
| `404.html` | Page not found |

Shared files live in `assets/` (`css/site.css`, `js/site.js`, `img/`, `fonts/`). Security headers are set in `_headers`.

## Hosting on Cloudflare Pages (for Fresh Tech)

1. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git** and choose this repository.
2. Build settings: **Framework preset: None**, **Build command: (leave empty)**, **Build output directory: `/`**.
3. Deploy. Every change pushed to the `main` branch then publishes automatically.
4. Under **Custom domains**, add `cirisgroup.co.uk` and `www.cirisgroup.co.uk`. Cloudflare issues the SSL certificate.
   Only the website records (`@` / `www`) should change. **Do not touch the MX, SPF, DKIM or autodiscover records**, because email runs on Microsoft 365.

## Enquiry form

The contact form is sent by [Web3Forms](https://web3forms.com) (free plan) straight to **info@cirisgroup.co.uk**, so no server code or mail setup is needed on Cloudflare.

1. Go to web3forms.com, enter `info@cirisgroup.co.uk` and request an access key. It arrives by email.
2. In `contact.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.
3. Until the key is added, the form tells visitors to email info@cirisgroup.co.uk instead.

There is a hidden spam honeypot field. The Content Security Policy in `_headers` allows the form to post to `api.web3forms.com`.

## Still to add before launch

Search the files for `TODO` or `[` to find these:

- ICO registration number (footer on every page, `[ZB number]`)
- LinkedIn company page link (footer)
- Official Cyber Essentials badge, once the certificate is issued (footer `badge-slot`)
- Web3Forms access key (`contact.html`)
- Privacy notice: retention period and director sign-off
- Accessibility statement: date prepared

## Editing

The header and footer are repeated in each HTML file, so change them on every page. Colours and fonts are set once at the top of `assets/css/site.css`.
