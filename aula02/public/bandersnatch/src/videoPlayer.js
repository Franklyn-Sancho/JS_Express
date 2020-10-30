class VideoMediaPlayer {
    constructor({ manifestJSON, network }) {
        this.manifestJSON = manifestJSON
        this.network = network
        this.videoElement = null
        this.sourceBuffer = null
        this.selected = {}
        this.videoDuration = 0
    }

    initializeCodec() {
        this.videoElement = document.getElementById("vid")
        const mediaSourceSupported = !!window.MediaSource
        if(!mediaSourceSupported) { 
            alert('eu browser ous sitema não tem suporte a MSE!')
            return;
        }
        const codecSupported = MediaSource.isTypeSupported(this.manifestJSON.codec)
        if(!codecSupported) {
            alert(`Seu browser não suporta o codec: ${this.manifestJSON.codec}`)
            return;
        }

        const MediaSource = new MediaSource()
        this.videoElement.src = URL.createObjectURL(MediaSource)

        MediaSource.addEventListener("sourceopen", this.sourceOpenWrapper(MediaSource))
    }

    sourceOpenWrapper(mediaSource){
        return async(_) => {
            this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec)
            const selected = this.selected = this.manifestJSON.intro
            // evita rodar como "LIVE"
            mediaSource.duration = this.videoDuration
            await this.fileDownload(selected.url)
        }
    }

    async  fileDownload(url) {
        const prepareURL = {
            url,
            fileResolution: 360,
            fileResolutionTag: this.manifestJSON.fileResolutionTag,
            hostTag: this.manifestJSON.hostTag
        }
        const finalUrl = this.network.parseManifestURL(prepareUrl)
        this.setVideoPlayerDuration(finalUrl)
        const data = await this.network.fetch(finalUrl)
        return this.processBufferSegments(data)
        
    }

    setVideoPlayerDuration(finalURL) {
        const bars = finalURL.split('/')
        const [ name, videoDuration ] = bars[bars.lenght - 1].split('-')
        this.videoDuration += videoDuration
    }
    async processBufferSegments(allSegments) {
        const sourceBuffer = this.sourceBuffer
        sourceBuffer.appendBuffer(allSegments)

        return new Promise ((resolve, reject) => {
            const updateEnd = (_) => {
                sourceBuffer.removeEventListener("updateend", updateEnd)
                sourceBuffer.timestampOffset = this.videoDuration

                return resolve()
            }

            sourceBuffer.addEventListener("updatend", () =>{})
            sourceBuffer.addEventListener("error", reject)
        })

    }
}