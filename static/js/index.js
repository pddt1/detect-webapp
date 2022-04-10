var MAX_SIDE_LEN = 1280;
const upload = document.querySelector('#file-input')
const preview = document.querySelector('.preview');
const output = document.querySelector('.output');
canvas = document.createElement('canvas');
context = canvas.getContext('2d');
rld = document.querySelector('.reload');
detect=document.querySelector('.detect');
img = new Image();
resized_img = new Image();
var orientation;
function onload_func() {
  // extracting the orientation info from EXIF which will be sent to the server
  EXIF.getData(img, function () {
    orientation = EXIF.getTag(this, 'Orientation');
    console.log(orientation);
  });
  // resize the sides of the canvas and draw the resized image
  [canvas.width, canvas.height] = reduceSize(img.width, img.height, MAX_SIDE_LEN);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  // adds the image that the canvas holds to the source
  resized_img.src = canvas.toDataURL('image/jpeg');
  // clean the result before doing anything
  preview.innerHTML = '';
  // append new image
  preview.appendChild(resized_img);
  // send the user image on server and wait for response, and, then, shows the result
  send_detect_show();
}
function reload() {
  location.reload();
}
upload.addEventListener('change', function(e) {
  preview.innerHTML = '';
  var reader= new FileReader();
  reader.onload=function(event){
    if(event.target.result){
      img.onload=onload_func;
      img.src=event.target.result;
    };
  };
  reader.readAsDataURL(event.target.files[0]);
})
function send_detect_show() {
  var element = document.getElementById('upload');
  // disable upload img
  element.parentNode.removeChild(element);
 // show the detect (progress) button
 detect.classList.remove('hide');
 // make the button unresponsive
 detect.classList.add('progress');
 // shows the status notification
 detect.innerHTML = 'Processing...';
 detect.parentNode.removeChild(detect);
 rld.classList.remove('hide');
 var blob = dataURItoBlob(preview.firstElementChild.src);
 // form a POST request to the server
 var form_data = new FormData();
 form_data.append('file', blob);
 //form_data.append('orientation', orientation);
 $.ajax({
   type: 'POST',
   url: 'http://localhost:3000/',
   data: form_data,
   timeout: 1000 * 25, // ms, to wait until .fail function is called
   contentType: false,
   processData: false,
   dataType: 'json',
 }).done(function (data, textStatus, jqXHR) {
   // replace the current image with an image with detected objects
   const ig=document.createElement('image');
   document.querySelector("#imgout").src=data['image'];
   // output.appendChild(document.createElement)
   // remove the detect button
   detect.parentNode.removeChild(detect);
   // and show the reload button
   rld.classList.remove('hide');
 }).fail(function (data) {
   alert("Wow! That's weird. It seems it didn't work for you, but it had to. Please let me know about this odd situation on vdyashin@gmail.com or in Issues on GitHub. Or reload the page and try again.");
   // remove the detect button
   detect.parentNode.removeChild(detect);
   // and show the reload button
   rld.classList.remove('hide');
 });
}
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}

function reduceSize(width, height, max_side_len) {
  if (Math.max(width, height) <= max_side_len) {
    return [width, height];
  }
  else if (width >= height) {
    height *= max_side_len / width;
    width = max_side_len;
    return [width, height];
  }
  else if (width < height) {
    width *= max_side_len / height;
    height = max_side_len;
    return [width, height];
  }
}
