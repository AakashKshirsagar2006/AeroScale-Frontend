/** Request body -> plain object. JSON string, or multipart FormData (a JSON part becomes an object, a file becomes a URL). */
const fileToUrl = (file) => new Promise((resolve) => {
  if (file.size > 300_000) return resolve(URL.createObjectURL(file)); // too big to keep in localStorage, lasts until reload
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.readAsDataURL(file);
});

export async function readBody(data) {
  if (!data) return {};
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const out = {};
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string') out[key] = value;
      else if (value.type === 'application/json') out[key] = JSON.parse(await value.text());
      else out[key] = await fileToUrl(value);
    }
    return out;
  }
  return typeof data === 'string' ? JSON.parse(data) : data;
}
