async function check() {
  const urls = [
    'https://southernarchitecture.in/robots.txt',
    'https://southernarchitecture.in/sitemap.xml',
    'https://southernarchitecture.in/',
    'https://southernarchitecture.in/designs/ridge-house',
    'https://southernarchitecture.in/architects',
    'https://southernarchitecture.in/plot-intelligence'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });
      const text = await res.text();
      console.log(`=== ${url} (HTTP ${res.status}) ===`);
      if (url.endsWith('.txt') || url.endsWith('.xml')) {
        console.log(text.slice(0, 500));
        console.log('...\n');
      } else {
        const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
        console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');
        
        const geoRegion = text.match(/name="geo\.region"\s+content="([^"]+)"/i);
        console.log('geo.region:', geoRegion ? geoRegion[1] : 'N/A');
        
        const geoPlacename = text.match(/name="geo\.placename"\s+content="([^"]+)"/i);
        console.log('geo.placename:', geoPlacename ? geoPlacename[1] : 'N/A');
        
        const geoPosition = text.match(/name="geo\.position"\s+content="([^"]+)"/i);
        console.log('geo.position:', geoPosition ? geoPosition[1] : 'N/A');

        const canonical = text.match(/rel="canonical"\s+href="([^"]+)"/i);
        console.log('Canonical:', canonical ? canonical[1] : 'N/A');

        const jsonLds = [...text.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
        console.log('Schema JSON-LD blocks found:', jsonLds.length);
        jsonLds.forEach((m, idx) => {
          try {
            const data = JSON.parse(m[1]);
            console.log(`  [Block ${idx + 1}] @type: ${data['@type']} | name: ${data.name || data.headline || '(unnamed)'}`);
          } catch(e) {
            console.log(`  [Block ${idx + 1}] JSON parse error: ${e.message}`);
          }
        });
        console.log('');
      }
    } catch(err) {
      console.error(`Error fetching ${url}:`, err.message);
    }
  }
}

check();
