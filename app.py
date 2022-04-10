from flask import Flask, render_template, jsonify, request
import os
from base64 import b64encode

from yolo_detection_images import Net_detect, detectObject

PROJECT_PATH = ''

PROJ_TEMP_PATH = os.path.join(PROJECT_PATH, 'proj_tmp')
ARCHIVE_PATH = os.path.join(PROJ_TEMP_PATH, 'upload_archive')
INPUT_PATH = os.path.join(PROJ_TEMP_PATH, 'input.jpg')
OUTPUT_PATH = os.path.join(PROJECT_PATH, 'output.jpg')
LOG_PATH = os.path.join(PROJ_TEMP_PATH, 'log.txt')

YOLOV3_WEIGHTS_PATH = os.path.join(PROJECT_PATH, 'weights/yolov3.weights')
YOLOV3_608_CFG_PATH = os.path.join(PROJECT_PATH, 'cfg/yolov3.cfg')
LABELS_PATH = os.path.join(PROJECT_PATH, 'data/classes.names')

#run the model wait to detect
net,labels,COLORS = Net_detect(YOLOV3_608_CFG_PATH,YOLOV3_WEIGHTS_PATH,LABELS_PATH)
JPG_QUALITY = 80

app = Flask(__name__)



# if there is no folder for archiving, create
if not os.path.exists(ARCHIVE_PATH):
    os.makedirs(ARCHIVE_PATH)
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def upload_file():

    # access files in the request. See the line: 'form_data.append('file', blob);'
    files = request.files['file']
    # save the image ('file') to the disk
    files.save(INPUT_PATH)
    try:
        orientation = request.form['orientation']
        print(f'Submitted orientation: {orientation}')
    except:
        orientation = 'undefined'
        print(vars(request))

    # run the predictions on the saved image
    img = detectObject(INPUT_PATH,net,labels,COLORS)

    with open(OUTPUT_PATH, 'rb') as in_f:
        # so we read an image and decode it into utf-8 string and append it
        # to data:image/jpeg;base64 and then return it.
        img_b64 = b64encode(in_f.read()).decode('utf-8')
        img_b64 = 'data:image/jpeg;base64, ' + img_b64

    return jsonify(name='input.jpg', image=str(img_b64))
if __name__ == '__main__':
    app.run('localhost',3000,debug=True)
