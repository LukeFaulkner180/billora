import {useEffect,useRef,useState} from 'react';
import {Icon} from './Icons';

type Props={onClose:()=>void;onCapture:(photo:Blob)=>void|Promise<void>};

function cameraMessage(error:unknown):string {
  if(error instanceof DOMException && (error.name==='NotAllowedError'||error.name==='PermissionDeniedError')) {
    return 'Camera permission was denied. Allow camera access for this website in your browser settings, then try again.';
  }
  if(error instanceof DOMException && (error.name==='NotFoundError'||error.name==='OverconstrainedError')) {
    return 'No compatible camera was found on this device.';
  }
  return 'Unable to start the camera. Check camera permissions and try again.';
}

export function ReceiptCamera({onClose,onCapture}:Props) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const captureBusy=useRef(false);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState('');
  const [capturing,setCapturing]=useState(false);
  const [retry,setRetry]=useState(0);

  useEffect(()=>{
    let active=true;
    const stop=()=>{streamRef.current?.getTracks().forEach(track=>track.stop());streamRef.current=null;};
    setReady(false);
    setError('');
    if(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia){
      setError('Live camera access requires a supported browser on a secure HTTPS connection.');
      return stop;
    }
    void navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},
      audio:false
    }).then(async stream=>{
      if(!active){stream.getTracks().forEach(track=>track.stop());return;}
      streamRef.current=stream;
      if(videoRef.current){
        videoRef.current.srcObject=stream;
        try {await videoRef.current.play();} catch { /* muted inline video may start on metadata */ }
      }
      if(active)setReady(true);
    }).catch(reason=>{if(active)setError(cameraMessage(reason));});
    return ()=>{active=false;stop();};
  },[retry]);

  async function capture(){
    if(captureBusy.current || !ready)return;
    const video=videoRef.current;
    if(!video || !video.videoWidth || !video.videoHeight){setError('Camera image is not ready. Hold the receipt steady and try again.');return;}
    captureBusy.current=true;
    setCapturing(true);
    try{
      const canvas=document.createElement('canvas');
      const scale=Math.min(1,2000/Math.max(video.videoWidth,video.videoHeight));
      canvas.width=Math.round(video.videoWidth*scale);
      canvas.height=Math.round(video.videoHeight*scale);
      const context=canvas.getContext('2d');
      if(!context)throw new Error('Camera image could not be processed.');
      context.drawImage(video,0,0,canvas.width,canvas.height);
      const blob=await new Promise<Blob>((resolve,reject)=>{
        canvas.toBlob(result=>result?resolve(result):reject(new Error('Could not capture the image.')),'image/jpeg',0.9);
      });
      // Stop the live camera immediately after the picture has been captured.
      streamRef.current?.getTracks().forEach(track=>track.stop());
      streamRef.current=null;
      await onCapture(blob);
    }catch(reason){
      setError(reason instanceof Error?reason.message:'Could not capture that image.');
    }finally{
      captureBusy.current=false;
      setCapturing(false);
    }
  }
  return <div className="billora-camera-backdrop">
    <section className="billora-camera-dialog" role="dialog" aria-modal="true" aria-labelledby="receipt-camera-title">
      <div className="billora-camera-head">
        <div><div className="billora-modal-overline">BILLORA RECEIPTS</div><h2 id="receipt-camera-title">Scan a receipt</h2></div>
        <button className="billora-camera-close" type="button" onClick={onClose} aria-label="Close camera"><Icon name="close"/></button>
      </div>
      <p className="billora-camera-hint">Point your camera at the receipt. Make sure the full total is visible and the text is sharp.</p>
      <div className="billora-camera-view">
        <video ref={videoRef} autoPlay muted playsInline aria-label="Live camera view of your receipt"/>
        {ready && !capturing && <div className="billora-camera-guide" aria-hidden="true"/>}
        {!ready && !error && <div className="billora-camera-placeholder" role="status"><Icon name="camera" size={32}/> Starting camera…</div>}
        {capturing && <div className="billora-camera-placeholder" role="status">Capturing receipt…</div>}
      </div>
      {error && <p className="billora-camera-error" role="alert">{error}</p>}
      <div className="billora-camera-actions">
        <button type="button" className="billora-secondary-button" onClick={onClose}>Cancel</button>
        {error ? <button type="button" className="billora-primary-button" onClick={()=>setRetry(x=>x+1)}>Try camera again</button> :
          <button type="button" className="billora-primary-button" onClick={()=>void capture()} disabled={!ready||capturing}>
            <Icon name="camera" size={18}/>{capturing?'Capturing…':'Capture receipt'}
          </button>}
      </div>
      <p className="billora-camera-privacy"><Icon name="shield" size={15}/> Camera frames are not uploaded or saved. You'll confirm the amount before recording a purchase.</p>
    </section>
  </div>;
}
