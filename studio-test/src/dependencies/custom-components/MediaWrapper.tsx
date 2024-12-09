import React from 'react'
import {IconButton} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'
import { imageSrcSetPaths } from '../utils/misc'
import '../utils/scorm'
import Visio from './Visio'

/** TODO NGINX rewrite
https://my-alfred-data-test.s3.eu-west-3.amazonaws.com/aftral-lms/prod/8ea1fa94-XXXXX-les/lms/blank.html

==> 

/SCORM/aftral-lms/prod/8ea1fa94-XXXXX-les/lms/blank.html

*/

const PATTERN = new RegExp(`${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}`);

export const getExtension = (filename: string) =>
  filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename

export const mediaWrapper = ({
  src,
  htmlHeight,
  htmlWidth,
  isIframe = false,
  visio,
  downloadable,
  ...props
}: {
  src: string
  htmlHeight?: string
  htmlWidth?: string
  isIframe?: boolean
  visio?: boolean
  downloadable?: boolean
}) => {

  /* TODO assign type to htmlWidth, htmlHeight */
  const doc = {
    width: htmlWidth || '100%',
    height: htmlHeight || '100%',
  }

  const forceExt = (src: string, isIframe:boolean) => {
     if (isIframe || isVideoProvider(src)) {
      return 'html'
     }
     return false
  }

  const isVideoProvider = (src: string) => {
    /* Detect YouTube and Vimeo url videos */
    const regex = /(http:|https:|)\/\/(player.|www.|meet.)?(jit\.si|vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/g
    return regex.test(src)
  }
  function forceDownload(blob:any, filename:any) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    // For Firefox https://stackoverflow.com/a/32226068
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Current blob size limit is around 500MB for browsers
  function downloadResource(url:string|undefined) {
    if (!url) { return}
    const filename = url?.split('\\')?.pop()?.split('/')?.pop();
    fetch(url,{
      headers: new Headers({
        'Origin': document.location.origin
      }),
      mode: 'cors'
    })
      .then(response => response.blob())
      .then(blob => {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
      })
      .catch(e => console.error(e));
  }

  const Comp = () =>
    downloadable &&
      (
      <div style={{display:'flex', justifyContent:'center'}} ><IconButton
        aria-label='download'
        color={props.color}
        backgroundColor={props.backgroundColor}
        icon={<DownloadIcon />}
        onClick={() => downloadResource(src||undefined)}
      /></div>) || (null)

  const orgExt=getExtension(src.toLowerCase())
  let ext = ['doc', 'docx', 'xls', 'xlsx', 'pps', 'ppsx', 'ppt', 'pptx', 'html', 'csv', 'pdf', 'mp4', 'webm'].includes(orgExt)  ? orgExt : forceExt(src?.toLowerCase(), isIframe)
  let visioId=null
  // TODO: must handle actual src with LMS system

  if (visio) {
    ext='visio'
    visioId= src.replace(/.*\//g, '')
  }
  if (ext=='html') {
    const parsedUrl = new URL(src)
    // Embed youtube
    if (/youtube.com/.test(parsedUrl.hostname) && !/embed/.test(src)) {
      const videoId=parsedUrl.searchParams.get('v')
      src=`https://www.youtube.com/embed/${videoId}`
    }
    // Embed video
    else if (/vimeo\.com/.test(parsedUrl.hostname) && !/player\.vimeo\.com/.test(parsedUrl.hostname)) {
      const parts=parsedUrl.pathname.match(/[^/]+/g)
      src=`https://player.vimeo.com/video/${parts[0]}?h=${parts[1]}`
    }
    else {//Certainly a SCORM
      if (PATTERN.test(parsedUrl.hostname)) {
        const scormId=parsedUrl.pathname
        src=`/SCORM${scormId}`
      }
    }

    // Preview for scorms for builders TODO really useful ?
    // else {
    //   // Replace the last part of the path with 'story.html'
    //   const pathParts = parsedUrl.pathname.split('/')
    //   pathParts[pathParts.length - 1] = 'story.html'
    //   parsedUrl.pathname = pathParts.join('/')
    //   src=parsedUrl.toString()
    // }
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
      )
    case 'pdf':
      return (
        <><object
          type="application/pdf"
          data={src}
          role={'document'}
          width={doc.width}
          height={doc.height}
        ></object>
        <Comp />
        </>
      )
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
      )
    case 'txt':
    case 'html':
      return (
        <>
        <iframe
          style={
            {
              height: 'inherit',
              width: 'inherit',
              minHeight: 'inherit',
              minWidth: 'inherit',
              borderRadius: 'inherit',
            }
          }
          loading="lazy"
          title={src}
          src={src}
          width={htmlWidth}
          height={htmlHeight}
          allow={visio? "camera *;microphone *" : ''}
          allowFullScreen
        ></iframe>
        <Comp />
        </>

      )
    case 'visio':
      return (
        <Visio room={visioId} />
      )
    default:
      const srcSet = imageSrcSetPaths(src)
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
      )
  }
}
