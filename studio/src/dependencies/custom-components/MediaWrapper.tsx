import React, { useEffect, useRef } from 'react';
import { IconButton } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { imageSrcSetPaths } from '../utils/misc';
import '../utils/scorm';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Configure le chemin du worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const PATTERN = new RegExp(`${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}`);

export const getExtension = (filename: string) =>
  filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;

export const mediaWrapper = ({
  src,
  htmlHeight,
  htmlWidth,
  isIframe = false,
  visio,
  downloadable,
}: {
  src: string;
  htmlHeight?: string;
  htmlWidth?: string;
  isIframe?: boolean;
  visio?: boolean;
  downloadable?: boolean;
}) => {
  const doc = {
    width: htmlWidth || '100%',
    height: htmlHeight || '100%',
  };

  const isVideoProvider = (src: string) => {
    const regex = /(http:|https:|)\/\/(player.|www.|meet.)?(jit\.si|vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/g;
    return regex.test(src);
  };

  const downloadResource = (url: string | undefined) => {
    if (!url) return;
    const filename = url.split('\\').pop()?.split('/').pop();
    fetch(url, {
      headers: new Headers({
        Origin: document.location.origin,
      }),
      mode: 'cors',
    })
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = filename || 'download';
        a.href = blobUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((e) => console.error(e));
  };

  const PDFViewer = ({ src }: { src: string }) => {
    const pdfContainer = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      const loadPDF = async () => {
        if (!pdfContainer.current) return;
  
        const pdf = await pdfjsLib.getDocument(src).promise;
        pdfContainer.current.innerHTML = ''; // Réinitialise le conteneur
  
        // Rendre chaque page du PDF
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
  
          // Adapte la taille au conteneur parent
          const containerWidth = pdfContainer.current.clientWidth;
          const viewport = page.getViewport({ scale: containerWidth / page.getViewport({ scale: 1 }).width });
  
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.maxWidth = '100%'; // Pour que chaque page soit responsif
          canvas.style.height = 'auto';
  
          if (context) {
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext).promise;
  
            if (pdfContainer.current) {
              pdfContainer.current.appendChild(canvas);
            }
          }
        }
      };
  
      loadPDF();
    }, [src]);
  
    return (
      <div
        ref={pdfContainer}
        style={{
          overflowY: 'auto',
          height: '100vh',
          width: '100%',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      />
    );
  };

  const Comp = () =>
    downloadable && (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <IconButton
          aria-label="download"
          icon={<DownloadIcon />}
          onClick={() => downloadResource(src || undefined)}
        />
      </div>
    );

  const orgExt = getExtension(src.toLowerCase());
  const ext = ['doc', 'docx', 'xls', 'xlsx', 'pps', 'ppsx', 'ppt', 'pptx', 'html', 'csv', 'pdf', 'mp4', 'webm'].includes(orgExt)
    ? orgExt
    : isIframe || isVideoProvider(src)
    ? 'html'
    : false;

  if (ext === 'html') {
    const parsedUrl = new URL(src);
    if (/youtube.com/.test(parsedUrl.hostname)) {
      const videoId = parsedUrl.searchParams.get('v');
      src = `https://www.youtube.com/embed/${videoId}`;
    } else if (/vimeo\.com/.test(parsedUrl.hostname) && !/player\.vimeo\.com/.test(parsedUrl.hostname)) {
      const parts = parsedUrl.pathname.match(/[^/]+/g);
      src = `https://player.vimeo.com/video/${parts[0]}?h=${parts[1]}`;
    } else if (PATTERN.test(parsedUrl.hostname)) {
      const scormId = parsedUrl.pathname;
      src = `/SCORM${scormId}`;
    }
  }

  switch (ext) {
    case 'mp4':
    case 'webm':
      return (
        <>
          <video
            width={doc.width}
            controls
            preload="none"
            poster="images/videocover.png"
          >
            <source src={src} type={`video/${ext}`} />
          </video>
          <Comp />
        </>
      );
    case 'pdf':
      return (
        <>
          <PDFViewer src={src} />
          <Comp />
        </>
      );
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'pps':
    case 'ppsx':
      return (
        <>
          <iframe
            title={src}
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${src}`}
            width={doc.width}
            height={doc.height}
            frameBorder="0"
            allowFullScreen
          ></iframe>
          <Comp />
        </>
      );
    case 'txt':
    case 'html':
      return (
        <>
          <iframe
            style={{
              height: 'inherit',
              width: 'inherit',
              minHeight: 'inherit',
              minWidth: 'inherit',
              borderRadius: 'inherit',
            }}
            loading="lazy"
            title={src}
            src={src}
            width={htmlWidth}
            height={htmlHeight}
            allow={visio ? 'camera *;microphone *' : ''}
            allowFullScreen
          ></iframe>
          <Comp />
        </>
      );
    default:
      const srcSet = imageSrcSetPaths(src);
      return (
        <>
          <img
            loading="lazy"
            src={src}
            width={doc.width}
            height={doc.height}
            alt=""
            srcSet={(srcSet && srcSet.join(', ')) || ''}
          />
          <Comp />
        </>
      );
  }
};
