const speedtest = require('speedtest-net');
const roundTo = require('round-to');

const multiplier = 1;

async function fetcher(onUploadValue, onDownloadValue, onDone) {
    const st = speedtest({ acceptLicense: true });

    st.on('downloadspeedprogress', (speed) => {
        onDownloadValue(Math.round(speed * multiplier));
    });

    st.on('uploadspeedprogress', (speed) => {
        onUploadValue(Math.round(speed * multiplier));
    });

    st.on('done', () => {
        onDone();
    });

    st.on('error', error => {
        if (error.code === 'ENOTFOUND') {
            console.error('Please check your internet connection');
        } else {
            console.lerror(error);
        }

        process.exit(1);
    });

}

module.exports = fetcher;