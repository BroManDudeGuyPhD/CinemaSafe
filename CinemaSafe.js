// Suppress punycode deprecation warning from transitive dep (whatwg-url via node-fetch v2)
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
	if (typeof warning === 'string' && warning.includes('punycode')) return;
	return originalEmitWarning.call(process, warning, ...args);
};

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
var http = require('http');
const https = require('https');
var fs = require('fs');
const { moveCursor } = require('readline');
const axios = require('axios');
const Jimp = require("jimp"); 
colors = require('colors');
const clear = require('clear');
const figlet = require('figlet');


//Initialize plugins
require('console-png').attachTo(console);
colors.enable()
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const prompt = require("prompt-sync")({ sigint: true });

// ══════════════════════════════════════════════════════════════════════
//  ⚙  OMNISSIAH ANIMATION ENGINE — Praise the Machine God  ⚙
// ══════════════════════════════════════════════════════════════════════
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Typewriter: prints each character with a per-char delay
async function typeWrite(text, charDelay = 28, newline = true) {
	for (const ch of text) {
		process.stdout.write(ch);
		await sleep(charDelay + Math.random() * 18);
	}
	if (newline) process.stdout.write('\n');
}

// Tree-line print: animates a single indented tree branch line
async function treeLine(prefix, label, value, charDelay = 18) {
	let valueColored = String(value || '');
	if (/open|locked|confirmed|engaged|acquired|consecrated|active|sanctified|acknowledged/i.test(valueColored))
		valueColored = valueColored.cyan;
	else if (/unavailable|error|failed/i.test(valueColored))
		valueColored = valueColored.red;
	else if (/reserving|acquiring|now/i.test(valueColored))
		valueColored = valueColored.magenta;
	else if (/cost|\$/i.test(label))
		valueColored = valueColored.yellow;
	else
		valueColored = valueColored.green;
	const line = prefix.green + label.yellow + ' ' + valueColored;
	for (const ch of line) {
		process.stdout.write(ch);
		await sleep(charDelay + Math.random() * 14);
	}
	process.stdout.write('\n');
}

// Print an entire tree block with staggered rows
async function printTree(header, rows) {
	const top    = '  ┌──⚙ ' + header;
	const bottom = '  └' + '─'.repeat(top.length - 3) + '⚙';
	await typeWrite(top.yellow, 14);
	for (let ri = 0; ri < rows.length; ri++) {
		const [label, value] = rows[ri];
		const branch = ri === rows.length - 1 ? '  └── ' : '  ├── ';
		await treeLine(branch, label, value, 16);
		await sleep(40);
	}
	await typeWrite(bottom.green, 10);
	console.log('');
}

function createSpinner(msg) {
	const frames = ['⚙ ◈', '⚙ ⊕', '⚙ ⊗', '⚙ ◉', '⚙ ⊙', '⚙ ◈', '⚙ ⊕', '⚙ ⊗'];
	let i = 0;
	const iv = setInterval(() => {
		process.stdout.write(`\r  ${frames[i++ % frames.length].green}  ${msg.green}   `);
	}, 130);
	return {
		stop(finalMsg) {
			clearInterval(iv);
			process.stdout.write(`\r${' '.repeat((process.stdout.columns || 80) - 1)}\r`);
			if (finalMsg) console.log(finalMsg);
		}
	};
}

async function countdownTimer(seconds, label) {
	label = label || 'Next scan cycle';
	const barWidth = 30;
	for (let rem = seconds; rem >= 0; rem--) {
		const filled = Math.round(((seconds - rem) / seconds) * barWidth);
		const bar = ('█'.repeat(filled) + '░'.repeat(barWidth - filled)).green;
		process.stdout.write(`\r  ⌛  ${label.green}  [${bar}]  ${String(rem + 's').padStart(4).green}  `);
		if (rem > 0) await sleep(1000);
	}
	process.stdout.write('\n');
}

async function omnissiahBoot() {
	// Per-char typewriter with per-segment coloring — no time cap, all lines play fully
	const bootType = async (text, color, delay) => {
		for (const ch of text) {
			process.stdout.write(ch[color] || ch);
			await sleep(delay + Math.random() * 18);
		}
	};

	const div = '  ⚙═══════════════════════════════════════════════════════════⚙'.green;
	console.log(div);
	const entries = [
		{ segs: [['  ├── ', 'green'], ['[ MECHANICUS ]', 'cyan'],   [' Initializing data-shrine uplink......', 'green']], res: [' CONSECRATED',  'cyan']   },
		{ segs: [['  ├── ', 'green'], ['[ MECHANICUS ]', 'cyan'],   [' Awakening servo-skull array..........', 'green']], res: [' ACTIVE',        'cyan']   },
		{ segs: [['  ├── ', 'green'], ['[ MECHANICUS ]', 'cyan'],   [' Calibrating auspex targeting matrix..', 'green']], res: [' LOCKED',        'cyan']   },
		{ segs: [['  ├── ', 'green'], ['[ OMNISSIAH  ]', 'yellow'], [' Blessing acquisition subroutines.....', 'green']], res: [' SANCTIFIED',    'red'] },
		{ segs: [['  └── ', 'green'], ['[ OMNISSIAH  ]', 'yellow'], [' Machine spirit communion.............', 'green']], res: [' ACKNOWLEDGED',  'red'] },
	];
	for (const { segs, res } of entries) {
		for (const [text, color] of segs) await bootType(text, color, 22);
		await sleep(180 + Math.random() * 340);
		await bootType(res[0], res[1], 32);
		process.stdout.write('\n');
		await sleep(120);
	}
	console.log(div);
	console.log('');
}

// Vanity screen
console.clear(); 
console.log('══⚙════════════════════════════════════════════════════════════════════════════⚙══'.green);
console.log(' ██████╗██╗███╗   ██╗███████╗███╗   ███╗ █████╗ ███████╗ █████╗ ███████╗███████╗'.green);
console.log('██╔════╝██║████╗  ██║██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝'.green);
console.log('██║     ██║██╔██╗ ██║█████╗  ██╔████╔██║███████║███████╗███████║█████╗  █████╗  '.green);
console.log('██║     ██║██║╚██╗██║██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══╝  '.green);
console.log('╚██████╗██║██║ ╚████║███████╗██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║     ███████╗'.green);
console.log(' ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝'.green);
console.log('══⚙════════════════════════════════════════════════════════════════════════════⚙══'.green);

// console.log(
// 		figlet.textSync('CINEMA-SAFE', { horizontalLayout: 'full' }).cyan
// );

const movieInfo = async (url) => {

	//Web Initialization
	const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	const pageSpin = createSpinner('Pict-feed scanning target theatre...');
	try {
		var response = await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000
		});
		pageSpin.stop('  ⚙  Pict-feed acquired. Extracting mission data...'.green);
	} catch (error) {
		pageSpin.stop('  ❌  Navigation failed.'.red);
		console.log("Error navigating to URL:".red);
        console.log(error.message);
        await browser.close();
        return false;
	}

	let missionTitle = '???';
	let missionShowtime = '???';
	let missionTheatre = '???';

	// Get title with error handling
    try {
        const getTitle = await page.waitForSelector('#ShowtimeTitleLink', { timeout: 45000 });
        missionTitle = await page.evaluate(name => name.innerText, getTitle);
    } catch (error) {
        console.log("⚠️ Could not find movie title - continuing".yellow);
    }

    // Get showtime with error handling and alternative selectors
    try {
        let getShowTime;
        try {
            getShowTime = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__date.dark__section', { timeout: 45000 });
        } catch (e) {
            console.log("Primary showtime selector failed, trying alternatives...".yellow);
            getShowTime = await page.waitForSelector('.showtime-info__date, [data-qa=showtime-date], p:contains("Date")', { timeout: 30000 });
        }

        if (getShowTime) {
            const time = await page.evaluate(name => name.innerText, getShowTime);
            if (!!time) {
                var todaysDate = new Date();
                var currentYear = todaysDate.getFullYear();
                let atRemove = time.replace("at", "");
                var dateTime = atRemove.split(",");
                var date = dateTime[1].trim() + currentYear;
                showTime = new Date(date);
                missionShowtime = time.trim();
            } else {
                console.log("⚠️ Couldn't parse showtime text".yellow);
            }
        }
    } catch (error) {
        console.log("⚠️ Failed to find showtime — using fallback +2h".red);
        var todaysDate = new Date();
        showTime = new Date(todaysDate.getTime() + (2 * 60 * 60 * 1000));
        missionShowtime = showTime.toLocaleString();
    }

	try {
		const getTheatre = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__theater.dark__section');
		missionTheatre = await page.evaluate(name => name.innerText, getTheatre);
	} catch(e) {}

	await printTree('MISSION BRIEFING', [
		['TARGET :', missionTitle],
		['SHOWTIME :', missionShowtime],
		['THEATRE :', missionTheatre],
	]);

	const getPoster = await page.waitForSelector('#HeaderTitleWrapper > div > div > a > img');
	const imgSRC = await getPoster.getProperty('src');
	const imageURL = await imgSRC.jsonValue();
	
	async function gatherImage(url){
		const image = await Jimp.read(url);
		image.resize(54, 80).quality(100);
		await image.writeAsync(__dirname + '/moviePoster.png');
	}

	async function displayImage(url){
		try {
			await gatherImage(url);
	
			const posterPath = __dirname + '/moviePoster.png';
			if (fs.existsSync(posterPath) && 
				fs.statSync(posterPath).size > 0) {
				
				var image = fs.readFileSync(posterPath);
				console.png(image);
			} else {
				console.log("Image file not created properly - skipping display".yellow);
			}

			// Clean up ephemeral poster file
			if (fs.existsSync(posterPath)) {
				fs.unlinkSync(posterPath);
			}
		} catch (error) {
			console.log("Unable to display image: " + error.message);
		}
	}

	try {
		await displayImage(imageURL);
	}
	catch (error) {
		console.log("Unable to display image - continuing without poster".yellow);
	}

	//Clean up browser
	await browser.close();
	return true;

	//await new Promise(resolve => setTimeout(resolve, 5000));

}

async function checkSeat(url, seatToCheck) {
	const spin = createSpinner(`Auspex scanning seat ${seatToCheck.yellow}...`);
	var status = "Error"
	const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');

	try {
		var response = await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000
		});

	} catch (error) {
		console.warn("Error")
		console.warn("Status code:", response.status());
		console.log(error.message);
	}

	try {
		const seat = await page.waitForSelector("#" + seatToCheck);
		const seatAvailiability = await seat.evaluate(node => node.outerHTML, seat);

		if (seatAvailiability.includes("This seat is available")) {
			status = "Open"
		}

		else if (seatAvailiability.includes("unavailable")) {
			status = "Unavailable"
		}

		spin.stop(`  ✔  ${seatToCheck.yellow}: ${status.cyan}`);
		await browser.close();
		return status

	} catch (error) {
		console.warn("Error in checkSeat function")
		console.log(error.message);
		spin.stop(`  ❌  Auspex error on seat ${seatToCheck.yellow}`.red);
		await browser.close();
	}

}

// ══════════════════════════════════════════════════════════════════════
//  ⚙  POPUP GAUNTLET — Dismiss interstitials before buy button  ⚙
//  Add any new Fandango dismiss-button selectors to POPUP_SELECTORS.
// ══════════════════════════════════════════════════════════════════════
const POPUP_SELECTORS = [
	'#jurassic-modal-decline-btn',
	// Add further popup dismiss selectors here as Fandango adds them
];

async function clearPopupsAndGetBuyBtn(page) {
	const BUY_SELECTOR = '#buynow-continue-btn';
	const MAX_ROUNDS = 8;

	for (let round = 0; round < MAX_ROUNDS; round++) {
		const racers = [
			page.waitForSelector(BUY_SELECTOR, { visible: true, timeout: 15000 })
				.then(el => ({ type: 'buy', el }))
				.catch(() => null),
			...POPUP_SELECTORS.map(sel =>
				page.waitForSelector(sel, { visible: true, timeout: 15000 })
					.then(el => ({ type: 'popup', selector: sel, el }))
					.catch(() => null)
			),
		];

		const winner = await Promise.race(racers);

		if (!winner) {
			console.log('  ├── ⚠  No buy button or popup appeared — aborting gauntlet'.red);
			return null;
		}

		if (winner.type === 'buy') return winner.el;

		// It's a popup — dismiss and loop
		try {
			await winner.el.click();
			await treeLine('  ├── ', `INTERSTITIAL CLEARED [${winner.selector}] :`, 'DISMISSED');
		} catch (e) {
			console.log(`  ├── ⚠  Failed to dismiss popup ${winner.selector}: ${e.message}`.red);
		}
		await sleep(700);
	}

	console.log('  ├── ❌ Popup gauntlet exceeded max rounds'.red);
	return null;
}

const ReserveBufferSeats = async (firstBufferSeat, secondBufferSeat, url) => {	
	console.log('');
	await typeWrite('  ⚙══ INITIATING BUFFER SEAT RESERVATION PROTOCOL ══⚙'.magenta, 20);

	//Initialize browser for reserving seats
	const navSpin = createSpinner('Establishing Mechadendrite uplink to seat matrix...');
	const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');
	
	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000
		});

	} catch (error) {
		console.warn("Error")
		console.warn("Status code:", response.status());
		console.log(error.message);
	}
	navSpin.stop('  ⚙  Seat matrix acquired. Initiating targeting sequence.'.cyan);

	//Buffer Seat 1
	try {
		const bufferSeat1 = await page.waitForSelector("#" + firstBufferSeat);
		if (bufferSeat1) {
			await bufferSeat1.click();
			await treeLine('  ├── ', `BUFFER SEAT 1 [${firstBufferSeat}] :`, 'LOCKED');
		}
		else {
			console.log("  ├── ❌ ERROR on Buffer Seat 1 SELECT".red);
		}
		await sleep(1000)
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}
	} catch (error) {
		console.log("  ├── ❌ ERROR on Buffer seat 1 TRY".red);
		console.log(error.message);
	}

	//Buffer Seat 2
	try {
		const bufferSeat2 = await page.waitForSelector("#" + secondBufferSeat);
		if (bufferSeat2) {
			await bufferSeat2.click();
			await treeLine('  ├── ', `BUFFER SEAT 2 [${secondBufferSeat}] :`, 'LOCKED');
		}
		else {
			console.log("  ├── ❌ ERROR on Buffer Seat 2 SELECT".red);
		}
		await sleep(1000)
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}
	} catch (error) {
		console.log("  ├── ❌ ERROR on Buffer seat 2 TRY".red);
		console.log(error.message);
	}

	//Check for 2 buffer seats selected
	try {
		const checkSeats = await page.waitForSelector("#stickyFooterSelectedCount");
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);

		if (seatValidatiion === '0 Selected:') {
			await treeLine('  └── ', 'STATUS :', '⌛ Seats still reserved — looping to maintain');
			await browser.close();
		}

		else {
			//Buffer seat clicks to complete - Press NEXT button to lock in
			const bufferSeatFirstNext = await page.waitForSelector("#NextButton");
			if (bufferSeatFirstNext) {
				await bufferSeatFirstNext.click();
				await treeLine('  ├── ', 'NEXT [1] :', 'CONFIRMED');

				const bufferSeatSecondNext = await page.waitForSelector("#ticket-selection-overlay-next-btn");
				if (bufferSeatSecondNext) {
					await bufferSeatSecondNext.click();
					await treeLine('  ├── ', 'NEXT [2] :', 'CONFIRMED');
				}
				else {
					console.log("  ├── ❌ ERROR on Buffer Seat Second Next".red);
				}
			}
			else {
				console.log("  ├── ❌ ERROR on Buffer First Next".red);
			}

			const buyBtn = await clearPopupsAndGetBuyBtn(page);
			if (buyBtn) {
				await buyBtn.click();
				await treeLine('  ├── ', 'BUY-NOW CONTINUE :', 'ENGAGED');
			} else {
				console.log("  ├── ❌ Could not reach buy-now button".red);
			}

			const priceLOL = await page.waitForSelector("#purchaseTotal");
			const dollarsSaved = await page.evaluate(price => price.innerText, priceLOL);
			await treeLine('  └── ', '✅ BUFFER SEATS RESERVED — COST :', dollarsSaved);

			await browser.close();
		}
		

	} catch (error) {
		console.log("  └── ❌ ERROR on final reservation step".red);
		console.log(error.message);
		await browser.close();
	}

}

const targetSeats = async (seats, url) => {	
	console.log('');
	await typeWrite('  ⚙══ INITIATING TARGET ACQUISITION PROTOCOL ══⚙'.magenta, 20);

	//Initialize browser for reserving seats
	const navSpin = createSpinner('Establishing Mechadendrite uplink to seat matrix...');
	const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');
	
	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000
		});

	} catch (error) {
		console.warn("Error")
		console.warn("Status code:", response.status());
		console.log(error.message);
	}
	navSpin.stop('  ⚙  Seat matrix acquired. Engaging target lock.'.cyan);

	const total = seats.length;
	for (let si = 0; si < seats.length; si++) {
		const seat = seats[si];
		const branch = si === total - 1 ? '  └── ' : '  ├── ';
		try {
			const targetSeat = await page.waitForSelector("#" + seat);
			if (targetSeat) {
				await targetSeat.click();
				await treeLine(branch, `TARGET [${seat}] :`, 'LOCKED');
			}
			else {
				console.log((branch + `❌ TARGET [${seat}] : FAILED`).red);
			}
			await sleep(1000)
			function sleep(ms) {
				return new Promise((resolve) => {
					setTimeout(resolve, ms);
				});
			}
		} catch (error) {
			console.log((branch + `❌ ERROR on seat ${seat}`).red);
			console.log(error.message);
		}
	}

	//Confirm & advance
	try {
		const checkSeats = await page.waitForSelector("#stickyFooterSelectedCount");
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);

		if (seatValidatiion === '0 Selected:') {
			await treeLine('  └── ', 'STATUS :', '⌛ Seats still reserved — looping to maintain');
			await browser.close();
		}

		else {
			const bufferSeatFirstNext = await page.waitForSelector("#NextButton");
			if (bufferSeatFirstNext) {
				await bufferSeatFirstNext.click();
				await treeLine('  ├── ', 'BOGEY [1] :', 'ELIMINATED');

				const bufferSeatSecondNext = await page.waitForSelector("#ticket-selection-overlay-next-btn");
				if (bufferSeatSecondNext) {
					await bufferSeatSecondNext.click();
					await treeLine('  ├── ', 'BOGEY [2] :', 'ELIMINATED');
				}
				else {
					console.log("  ├── ❌ ERROR on Target Second Next".red);
				}
			}
			else {
				console.log("  ├── ❌ ERROR on Target First Next".red);
			}

			const buyBtn = await clearPopupsAndGetBuyBtn(page);
			if (buyBtn) {
				await buyBtn.click();
				await treeLine('  ├── ', 'BUY-NOW CONTINUE :', 'ENGAGED');
			} else {
				console.log("  ├── ❌ Could not reach buy-now button".red);
			}

			const priceLOL = await page.waitForSelector("#purchaseTotal");
			const dollarsSaved = await page.evaluate(price => price.innerText, priceLOL);
			await treeLine('  └── ', '✅ TARGETS ACQUIRED — COST :', dollarsSaved);

			await browser.close();
		}

	} catch (error) {
		console.log("  └── ❌ ERROR on final targeting step".red);
		console.log(error.message);
		await browser.close();
	}

}

const bufferLoop = async (startSeat, endSeat, url) => {

	var todaysDate = new Date()

	await movieInfo(url);

	if (!!showTime) {
		if (todaysDate.getTime() < showTime.getTime())
			await typeWrite('  ⚙  Show not yet begun — initiating patrol loop'.magenta, 20);
		else
			await typeWrite(('  ⚙  Show has passed: ' + todaysDate).yellow, 18);
	}

	//Seat Logic (determine how many seats and what buffer seats are)
	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
	let amountToBuffer = (endSeatNumber - startSeatNumber) + 1;
	startSeat = startSeat.toUpperCase();
	var row = startSeat.replace(/[^a-zA-Z]+/g, '');
	var firstBufferSeat = row + (+startSeatNumber - 1)
	var secondBufferSeat = row + (+endSeatNumber + 1)

	//Loops every 30 seconds until showtime passes
	while (todaysDate.getTime() < showTime.getTime()) {
		var loopTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		console.log('');
		await typeWrite(('  ┌──⚙ SCAN CYCLE — ' + loopTime).yellow, 14);
		//Check that seats are availiable
		var seatCheck1 = await checkSeat(url, firstBufferSeat)
		var seatCheck2 = await checkSeat(url, secondBufferSeat)

		if (seatCheck1.includes("Open") && seatCheck2.includes("Open")) {
			await treeLine('  ├── ', `${firstBufferSeat} :`, seatCheck1);
			await treeLine('  ├── ', `${secondBufferSeat} :`, seatCheck2);
			await treeLine('  └── ', 'STATUS :', 'BOTH OPEN — RESERVING NOW');
			await ReserveBufferSeats(firstBufferSeat, secondBufferSeat, url)
		}

		else if (seatCheck1.includes("Unavailable") || seatCheck2.includes("Unavailable")) {
			await treeLine('  ├── ', `${firstBufferSeat} :`, seatCheck1);
			await treeLine('  ├── ', `${secondBufferSeat} :`, seatCheck2);
			await treeLine('  └── ', 'STATUS :', 'UNAVAILABLE — awaiting vacancy');
		}

		else {
			await treeLine('  └── ', 'STATUS :', 'ERROR STATE — retrying');
		}
		console.log('');
		console.log('  ⚙══════════════════════════════════════════════════⚙'.green);
		await countdownTimer(45, 'Mechadendrite sweep interval');
	}

	console.time("dbsave");
	console.log("Showtime occured at ")
	console.timeEnd("dbsave");

	console.log("Showtime occured at " + showtime)


}

const targetLoop = async (seats, url) => {

	var todaysDate = new Date()

	await movieInfo(url);

	if (!!showTime) {
		if (todaysDate.getTime() < showTime.getTime())
			await typeWrite('  ⚙  Show not yet begun — initiating patrol loop'.magenta, 20);
		else
			await typeWrite(('  ⚙  Show has passed: ' + todaysDate).yellow, 18);
	}

	//Loops every 30 seconds until showtime passes
	while (todaysDate.getTime() < showTime.getTime()) {
		var loopTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		console.log('');
		await typeWrite(('  ┌──⚙ SCAN CYCLE — ' + loopTime).yellow, 14);
		//Check that seats are availiable
		var seatCheck = await checkSeat(url, seats[0])

		if (seatCheck.includes("Open") ) {
			await treeLine('  ├── ', `${seats[0]} :`, seatCheck);
			await treeLine('  └── ', 'STATUS :', 'OPEN — ACQUIRING NOW');
			await targetSeats(seats, url)
		}

		else if (seatCheck.includes("Unavailable") ) {
			await treeLine('  ├── ', `${seats[0]} :`, seatCheck);
			await treeLine('  └── ', 'STATUS :', 'UNAVAILABLE — awaiting vacancy');
		}

		else {
			await treeLine('  └── ', 'STATUS :', 'ERROR STATE — retrying');
		}
		console.log('');
		console.log('  ⚙══════════════════════════════════════════════════⚙'.green);
		await countdownTimer(45, 'Mechadendrite sweep interval');
	}

	console.time("dbsave");
	console.log("Showtime occured at ")
	console.timeEnd("dbsave");

	console.log("Showtime occured at " + showtime)


}

//const menuSelection = prompt("CinemaSafe.js ");

var showTime



const prompts = require('prompts');

// Direct call support: node CinemaSafe.js Buffer <url> <startSeat> <endSeat>
// or: node CinemaSafe.js Target <url> <seat1,seat2,...>
function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        if (argv[i].startsWith('-')) {
            const key = argv[i].replace(/^-+/, '').toLowerCase();
            let value = true;
            if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                value = argv[i + 1];
                i++;
            }
            args[key] = value;
        }
    }
    return args;
}

const namedArgs = parseArgs(process.argv);

if (require.main === module && (process.argv.length > 2 || Object.keys(namedArgs).length > 0)) {
    // Named argument support
    if (namedArgs.mode === 'Buffer' && namedArgs.url && namedArgs.startseat && namedArgs.endseat) {
        bufferLoop(namedArgs.startseat, namedArgs.endseat, namedArgs.url);
    } else if (namedArgs.mode === 'Target' && namedArgs.url && namedArgs.seats) {
        const seats = namedArgs.seats.split(',').map(s => s.trim().toUpperCase());
        targetLoop(seats, namedArgs.url);
    }
    // Fallback to positional argument support for backward compatibility
    else if (process.argv[2] === "Buffer" && process.argv.length >= 6) {
        const url = process.argv[3];
        const startSeat = process.argv[4];
        const endSeat = process.argv[5];
        bufferLoop(startSeat, endSeat, url);
    } else if (process.argv[2] === "Target" && process.argv.length >= 5) {
        const url = process.argv[3];
        const seats = process.argv[4].split(',').map(s => s.trim().toUpperCase());
        targetLoop(seats, url);
    } else {
        console.log('  ⚙  USAGE:'.yellow);
        console.log('  ├──'.green + '  node CinemaSafe.js Buffer'.yellow + ' <url> <startSeat> <endSeat>'.cyan);
        console.log('  ├──'.green + '  node CinemaSafe.js Target'.yellow + ' <url> <seat1,seat2,...>'.cyan);
        console.log('  ├──'.green + '  node CinemaSafe.js -mode Buffer'.yellow + ' -url <url> -startSeat <s> -endSeat <e>'.cyan);
        console.log('  └──'.green + '  node CinemaSafe.js -mode Target'.yellow + ' -url <url> -seats <seat1,...>'.cyan);
        process.exit(1);
    }
} else {
    // ...existing menu system...
    (async () => {
        await omnissiahBoot();
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: '⚙  SELECT OPERATIONAL MODE'.yellow,
            choices: [
                { title: 'Buffer Mode'.green, description: 'Establish cordon sanitaire around a seat range'.cyan, value: 'Buffer' },
                { title: 'Target Mode'.green, description: 'Acquire up to 20 designated seats (non-sequential)'.cyan, value: 'Target' }
            ],
            initial: 1
        });

        console.log(''); 

        if (response.value.includes("Buffer")) {
            const link = await prompts({
                type: 'text',
                name: 'value',
                message: '⚙  Fandango Link'.yellow + ' (seat selection page URL):'.green,
                validate: value => !value.includes("https://tickets.fandango.com/") ? 'Link must begin: https://tickets.fandango.com/'.red : true
            });

            console.log(''); 
            const startSeat = prompt("  ├── START seat: ".yellow);
            const endSeat   = prompt("  └──   END seat: ".yellow);
            console.log(''); 
            bufferLoop(startSeat, endSeat, link.value);
        }	console.log('');

        if (response.value.includes("Target")) {
            const link = await prompts({
                type: 'text',
                name: 'value',
                message: '⚙  Fandango Link'.yellow + ' (seat selection page URL):'.green,
                validate: value => !value.includes("https://tickets.fandango.com/") ? 'Link must begin: https://tickets.fandango.com/'.red : true
            });
            console.log(''); 
            const seats = await prompts({
                type: 'list',
                name: 'targets',
                message: '⚙  Target designations'.yellow + ' (comma-separated, up to 20):'.green,
                initial: '',
                separator: ','
            });

            console.log(''); 
            const uppercaseSeats = seats.targets.map(t => t.toUpperCase());
            targetLoop(uppercaseSeats, link.value);
        }
    })();
}





//ReserveBufferSeats(startSeat, endSeat, link);
// a1,b4,c5,d6,e7,a5,b6,d4,e3
