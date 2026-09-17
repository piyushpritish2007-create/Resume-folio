import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_W = 210;
const A4_H = 297;

export async function downloadResumePdf(source: HTMLElement, filename: string): Promise<void> {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-12000px;top:0;width:210mm;background:#ffffff;z-index:-1;pointer-events:none;";
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.width = "210mm";
  clone.style.minHeight = "297mm";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.position = "static";
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 8000,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
      onclone: (doc) => {
        const paper = doc.querySelector(".resume-paper") as HTMLElement | null;
        if (paper) {
          paper.style.transform = "none";
          paper.style.width = "210mm";
        }
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.93);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgWidth = A4_W;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= A4_H;

    while (heightLeft > 1) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= A4_H;
    }

    pdf.save(filename);
  } finally {
    host.remove();
  }
}
