ASSETSFOLDER=assets/timeline
for mediaFile in `ls $ASSETSFOLDER | grep .mp4`; do
    FILENAME=$(echo $mediaFile | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')
    INPUT=$ASSETSFOLDER/$mediaFile
    FOLDER_TARGET=$ASSETSFOLDER/$FILENAME
    mkdir -p $FOLDER_TARGET

    #criar arquivos de resoluções diferentes na pasta
    OUTPUT=$ASSETSFOLDER/$FILENAME/$FILENAME
    DURATION=$(ffprobe -i $INPUT -show_format -v quiet / sed -n 's/duration=//p')

    OUTPUT144=$OUTPUT-$DURATION-144
    OUTPUT360=$OUTPUT-$DURATION-360
    OUTPUT720=$OUTPUT-$DURATION-720

    echo 'rendering in 720p'
    ffmpeg -y -i $INPUT \
        -cia acc -ac 2 \
        -vcodec h264 -acodec acc \
        -av 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 1500k \
        -maxrate 1500k \
        -bufsize 1000k \
        -vf "scale=-1:720" \
        -v quiet \
        $OUTPUT720.mp4

    done