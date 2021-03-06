
// this is not working when preserveDrawingBuffer set false
// TODO use read framebuffer
export function downloadCanvasPNGImage(canvas: HTMLCanvasElement, name: string) {
  const link = document.createElement('a');
  link.setAttribute('download', name + '.png');
  link.setAttribute('href', canvas.toDataURL("image/png")
     .replace("image/png", "image/octet-stream"));
  link.click();
}

async function getStringContentFromFile(file: Blob) {
  const reader = new FileReader();
  return new Promise<string>(function (resolve, reject) {
    reader.onload =  () => {
      const str = reader.result;
      resolve(str as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}


let temp; // input ele maybe will GC in raf calls, maybe a bug
export function openFile(): Promise<Blob> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    const func = (e: any) => {
      temp = undefined;
      resolve(e.target.files[0])
    }
    input.addEventListener('change', func);
    temp = input;
    input.click();
    if (temp === null) { }; // for pass not use check
  })
}

export async function loadStringFromFile() {
  const file = await openFile();
  const str = await getStringContentFromFile(file);
  return str;
}

async function getDataUrlFromFile(file: Blob) {
  const reader = new FileReader();
  return new Promise<string>(function (resolve, reject) {
    reader.onload =  () => {
      const str = reader.result;
      resolve(str as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function loadImageFromFile() {
  const file = await openFile();
  const url = await getDataUrlFromFile(file);
  return loadImageFromURL(url);
}

export async function loadImageFromURL(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject
  })
}
