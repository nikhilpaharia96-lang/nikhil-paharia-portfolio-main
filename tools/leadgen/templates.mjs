// listmonk campaign bodies (Go templates). One per pitch group. Subjects are static (campaign-level in listmonk).
// Every claim in the body comes from something the audit actually observed, and phrased as an observation.
const footer = (cfg) => `
<p>Regards,<br>${cfg.senderName}<br><a href="${cfg.siteUrl}">${cfg.siteUrl.replace(/^https?:\/\//, '')}</a></p>
<p style="font-size:12px;color:#777;line-height:1.5">
You're receiving this because your business email is listed publicly. ${cfg.businessAddress}<br>
Not interested? <a href="{{ UnsubscribeURL }}">Unsubscribe</a> and I won't email you again.
</p>`;

const cta = (cfg) => `
<p>If it's useful, just reply <b>"yes"</b> and I'll send a quick free mockup and quote.
${cfg.calLink ? `Or pick a time for a free 15-minute call: <a href="${cfg.calLink}">${cfg.calLink}</a>.` : ''}
You can also see my work and request a free quote here: <a href="{{ .Subscriber.Attribs.link }}">my portfolio</a>.</p>`;

export const GROUPS = {
  'no-website': {
    subject: (niche, city) => [`Website for your ${niche} in ${city}?`, `Quick question about your Google listing`, `A simple website for your ${niche} business`],
    body: (cfg) => `<p>Hi {{ .Subscriber.Attribs.business }} team,</p>
<p>I came across {{ .Subscriber.Attribs.business }} on Google Maps. {{ .Subscriber.Attribs.praise }}</p>
<p>One thing I noticed: {{ .Subscriber.Attribs.issue }}. Many customers in {{ .Subscriber.Attribs.city }} check a business online before they call, so a fast, simple website with your services, photos and a call/WhatsApp button can turn those searches into enquiries.</p>
<p>I'm ${cfg.senderName}, a web developer who builds affordable websites for local businesses. ${cfg.offerLine || ''}</p>${cta(cfg)}${footer(cfg)}`,
  },
  'site-issue': {
    subject: (niche, city) => [`Quick note about your website`, `A small fix for your ${niche} website`, `Noticed something on your website`],
    body: (cfg) => `<p>Hi {{ .Subscriber.Attribs.business }} team,</p>
<p>I came across {{ .Subscriber.Attribs.business }} on Google Maps. {{ .Subscriber.Attribs.praise }}</p>
<p>While looking at your website I noticed that {{ .Subscriber.Attribs.issue }}.{{ if .Subscriber.Attribs.issue2 }} Also, {{ .Subscriber.Attribs.issue2 }}.{{ end }} These are usually quick to fix, and they affect how many visitors turn into calls and bookings.</p>
<p>I'm ${cfg.senderName}, a web developer who helps local businesses with this. ${cfg.offerLine || ''}</p>${cta(cfg)}${footer(cfg)}`,
  },
};
export const groupOf = (angle) => (angle === 'no_website' || angle === 'social_only' ? 'no-website' : 'site-issue');
