// Demo catalogue for mock mode. Deterministic, so the same product always has the same id, price and stock.
const REGULAR = [
  ['Apple AirPods Pro (2nd gen)', 24900, 'Active noise cancellation, adaptive transparency and a MagSafe charging case.'],
  ['Sony WH-1000XM5 Headphones', 29990, 'Industry-leading noise cancellation with 30 hours of battery life.'],
  ['Samsung Galaxy S24', 74999, '6.2in AMOLED display, 50MP camera and all-day battery.'],
  ['OnePlus Nord CE 3 5G', 24999, '120Hz AMOLED display with 100W fast charging.'],
  ['Dell XPS 13 Laptop', 99990, 'Ultra-thin 13.4in InfinityEdge display, Intel Core i7, 16GB RAM.'],
  ['HP Pavilion Gaming Laptop', 64990, 'Ryzen 5, GTX 1650 graphics and a 144Hz display.'],
  ['Apple Watch SE', 29900, 'Heart-rate, crash detection and fitness tracking on your wrist.'],
  ['Noise ColorFit Pro Smartwatch', 3999, '1.8in display, SpO2 monitoring and 7-day battery.'],
  ['boAt Rockerz 450 Headphones', 1499, 'Wireless over-ear headphones with 15 hours of playback.'],
  ['JBL Flip 6 Speaker', 9999, 'Waterproof portable Bluetooth speaker with punchy bass.'],
  ['Canon EOS 200D II Camera', 48990, '24.1MP DSLR with Dual Pixel autofocus and 4K video.'],
  ['GoPro HERO11 Black Camera', 41990, '5.3K video, HyperSmooth 5.0 stabilisation, waterproof to 10m.'],
  ['LG 43in 4K Smart TV', 32990, 'UHD display with webOS and built-in streaming apps.'],
  ['Mi 32in HD Smart TV', 12999, 'Android TV with Chromecast and Dolby Audio.'],
  ['Logitech MX Master 3S Mouse', 9495, 'Quiet clicks, 8K DPI sensor and multi-device pairing.'],
  ['Keychron K2 Wireless Keyboard', 8499, 'Hot-swappable mechanical keyboard with Mac and Windows layouts.'],
  ['Amazon Echo Dot (5th gen)', 4499, 'Smart speaker with Alexa and improved bass.'],
  ['realme Buds Air 5 Earbuds', 3299, '50dB active noise cancellation and 38 hours of playtime.'],
  ['Lenovo ThinkPad E14 Laptop', 58990, 'Business-class laptop with a spill-resistant keyboard.'],
  ['PlayStation DualSense Controller', 5990, 'Haptic feedback and adaptive triggers.'],
  ['Fitbit Charge 6 Band', 14999, 'Built-in GPS and Google apps on a slim fitness tracker.'],
  ['Bose SoundLink Flex Speaker', 13900, 'Rugged, waterproof Bluetooth speaker with clear sound.'],
  ['Nikon Z50 Mirrorless Camera', 79990, '20.9MP mirrorless camera with a compact body.'],
  ['Samsung 27in Curved Monitor', 15990, 'Curved 1500R display with a 75Hz refresh rate.'],
  ['Redmi Note 13 Pro', 23999, '200MP camera and a vivid 120Hz AMOLED panel.'],
  ['Apple iPad (10th gen)', 33900, '10.9in Liquid Retina display with the A14 Bionic chip.'],
  ['Anker 65W GaN Charger', 3499, 'Charges a laptop and phone at once from one slim plug.'],
  ['Marshall Emberton II Speaker', 14999, 'Signature sound in a pocket-sized portable speaker.'],
];

const SALE = [
  ['iPhone 15 (128GB)', 69900, 49999, 100],
  ['ASUS ROG Strix G16 Gaming Laptop', 129990, 79999, 40],
  ['Samsung Galaxy S24 Ultra', 129999, 99999, 60],
  ['Apple AirPods Pro', 26900, 12999, 150],
  ['Sony WH-1000XM5 Wireless Headphones', 34990, 24999, 80],
  ['Apple Watch Series 9', 41900, 29999, 70],
  ['MacBook Air M2 (13in)', 114900, 89999, 35],
  ['OnePlus Nord 3 5G', 33999, 24999, 120],
  ['LG 55in OLED Smart TV', 149990, 94990, 25],
  ['PlayStation 5 Console', 54990, 44990, 30],
  ['GoPro HERO12 Black Camera', 44990, 31999, 55],
  ['Dyson V12 Cordless Vacuum', 52900, 38900, 45],
  ['Nothing Phone (2a)', 25999, 18999, 90],
  ['Fire-Boltt Ninja Smartwatch', 4999, 1499, 300],
];

const hex = (n) => n.toString(16).padStart(12, '0');
const id = (kind, i) => `${kind}0000000-0000-4000-8000-${hex(i + 1)}`;

const HOUR = 3600_000;
const nextBoundary = (now, period, offset) => Math.floor((now - offset) / period) * period + period + offset;

export function buildProducts(now = Date.now()) {
  const regular = REGULAR.map(([name, price, description], i) => ({
    id: id('a', i), name, description: `${description}\n\nSold and shipped by a verified AeroScale seller.`, price,
    status: 'ACTIVE', imageUrl: null, availableStock: [34, 8, 120, 3, 56, 0, 22, 90, 14, 41][i % 10],
    createdAt: now - i * 3_600_000, flashSale: null,
  }));

  const sale = SALE.map(([name, price, salePrice, total], i) => {
    const upcoming = i >= 10; // last four have not started yet
    const period = (upcoming ? 5 : 3 + (i % 4)) * HOUR;
    const offset = i * 1_117_000;
    const boundary = nextBoundary(now, period, offset);
    const startTime = upcoming ? boundary : boundary - period;
    const endTime = upcoming ? boundary + 2 * HOUR : boundary;
    const sold = upcoming ? 0 : Math.floor(total * (0.32 + ((i * 29) % 58) / 100));
    return {
      id: id('b', i), name, description: `Limited-time flash price. Only ${total} units for this sale.\n\nSold and shipped by a verified AeroScale seller.`,
      price, status: 'ACTIVE', imageUrl: null, availableStock: total - sold, createdAt: now - (40 + i) * 3_600_000,
      flashSale: {
        id: id('c', i), state: upcoming ? 'UPCOMING' : 'LIVE',
        startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(),
        maxItemsPerUser: [2, 1, 2, 3, 2, 1, 1, 2, 1, 1, 2, 1, 3, 4][i], salePrice,
        discountPercent: Math.round((1 - salePrice / price) * 100), totalQuantity: total, soldQuantity: sold,
      },
    };
  });
  return { regular, sale };
}
