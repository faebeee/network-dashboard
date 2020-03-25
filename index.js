#!/usr/bin/env node

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const screen = blessed.screen();
const fetcher = require('./fetcher');

const downloadDataSets = [];
const uploadDataSets = [];
const fileSizeInBytes = 1024 * 1024 * 100;
const MAX_LENGTH = 50;
const INTERVALL = 1000;
const REQUEST_MAX = 100;
let counter = 0;


const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })

const downloadLine = grid.set(2, 0, 5, 12, contrib.line, {
    label: 'Down Mbps'
    , tags: true
    , style: { line: 'blue' }
})
const uploadLine = grid.set(7, 0, 5, 12, contrib.line, {
    label: 'Up Mbps'
    , tags: true
    , style: { line: 'yellow' }
})

const LCD_CONFIG = {
    segmentWidth: 0.06 // how wide are the segments in % so 50% = 0.5
    , segmentInterval: 0.11 // spacing between the segments in % so 50% = 0.550% = 0.5
    , strokeWidth: 0.11 // spacing between the segments in % so 50% = 0.5
    , elements: 4 // how many elements in the display. or how many characters can be displayed.
    , display: 321 // what should be displayed before first call to setDisplay
    , elementSpacing: 4 // spacing between each element
    , elementPadding: 2 // how far away from the edges to put the elements
};

const downloadMax = grid.set(0, 0, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Max Download',
    color: 'blue'
});

const downloadMin = grid.set(0, 2, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Min Download',
    color: 'blue'
});

const downloadAvg = grid.set(0, 4, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Avg Download',
    color: 'blue'
});

const uploadMax = grid.set(0, 10, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Max Upload',
    color: 'yellow'
});

const uploadMin = grid.set(0, 8, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Min Upload',
    color: 'yellow'
});

const uploadAvg = grid.set(0, 6, 2, 2, contrib.lcd, {
    ...LCD_CONFIG,
    label: 'Avg Upload',
    color: 'yellow'
});


screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

function fetchData() {
    fetcher((value) => {
        uploadDataSets.push(value)
    }, (value) => {
        downloadDataSets.push(value)
    }, () => {
        setTimeout(fetchData, INTERVALL);
    });
}

async function render() {

    downloadLine.setData([
        {
            title: 'Download',
            x: downloadDataSets,
            y: downloadDataSets
        }
    ]);
    uploadLine.setData([
        {
            title: 'Upload',
            x: uploadDataSets,
            y: uploadDataSets
        }
    ]);

    const avg = downloadDataSets.reduce((acc, v) => {
        return acc + v;
    }, 0) / downloadDataSets.length;

    downloadAvg.setDisplay(avg);
    downloadMax.setDisplay(Math.max(...downloadDataSets));
    downloadMin.setDisplay(Math.min(...downloadDataSets));


    const upAvg = uploadDataSets.reduce((acc, v) => {
        return acc + v;
    }, 0) / uploadDataSets.length;

    uploadAvg.setDisplay(upAvg);
    uploadMax.setDisplay(Math.max(...uploadDataSets));
    uploadMin.setDisplay(Math.min(...uploadDataSets));

    screen.render();

    setTimeout(() => render(), INTERVALL);
}

fetchData();
render();
