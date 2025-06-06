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

// Vanity screen
console.clear(); 
console.log('==================================================================================='.cyan);
console.log(' ██████╗██╗███╗   ██╗███████╗███╗   ███╗ █████╗ ███████╗ █████╗ ███████╗███████╗'.magenta);
console.log('██╔════╝██║████╗  ██║██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝'.magenta);
console.log('██║     ██║██╔██╗ ██║█████╗  ██╔████╔██║███████║███████╗███████║█████╗  █████╗  '.magenta);
console.log('██║     ██║██║╚██╗██║██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══╝  '.magenta);
console.log('╚██████╗██║██║ ╚████║███████╗██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║     ███████╗'.magenta);
console.log(' ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝'.magenta);
console.log('===================================================================================='.cyan);

// console.log(
// 		figlet.textSync('CINEMA-SAFE', { horizontalLayout: 'full' }).cyan
// );

const movieInfo = async (url) => {

	console.log('');
	console.log('==================================================================================='.cyan);
	console.log('*****     +     +     + Commencing Target Acquisition +     +     +     +     *****'.cyan.bgMagenta);
	console.log('==================================================================================='.cyan);
	console.log('');

	//Web Initialization
	const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	try {
		var response = await page.goto(url, {
			waitUntil: "networkidle2",
			timeout: 60000
		});

		
	} catch (error) {
		console.log("Error navigating to URL:".red);
        console.log(error.message);
        await browser.close();
        return false;
	}

	// Get title with error handling
    try {
        const getTitle = await page.waitForSelector('#ShowtimeTitleLink', { timeout: 45000 });
        const title = await page.evaluate(name => name.innerText, getTitle);
        console.log('Title: ' + title.cyan);
    } catch (error) {
        console.log("⚠️ Could not find movie title - continuing".yellow);
    }

    // Get showtime with error handling and alternative selectors
    try {
        // Try the primary selector first
        let getShowTime;
        try {
            getShowTime = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__date.dark__section', { timeout: 45000 });
        } catch (e) {
            console.log("Primary showtime selector failed, trying alternatives...".yellow);
            // Try alternative selectors
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
                console.log('Showtime: ' + time.cyan);
            } else {
                console.log("⚠️ Couldn't parse showtime text".yellow);
            }
        }
    } catch (error) {
        console.log("⚠️ Failed to find showtime information - using current time + 2 hours".red);
        // Fallback: set showtime to current time + 2 hours
        var todaysDate = new Date();
        showTime = new Date(todaysDate.getTime() + (2 * 60 * 60 * 1000));
        console.log("Using fallback showtime: " + showTime.toLocaleString().cyan);
    }

	const getTheatre = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__theater.dark__section');
	const theatre = await page.evaluate(name => name.innerText, getTheatre);
	console.log('Theatre: ' + theatre.cyan);

	// const getAddress = await page.waitForSelector('#ShowtimeTitleLink');
	// const address = await page.evaluate(name => name.innerText, getAddress);
	// console.log('Address: ' + address);

	const getPoster = await page.waitForSelector('#HeaderTitleWrapper > div > div > a > img');
	const imgSRC = await getPoster.getProperty('src');
	const imageURL = await imgSRC.jsonValue();
	
	async function gatherImage(url){
		await Jimp.read(url)
			.then((image) => {
				return image
					.resize(54, 80)
					.quality(100)
					.write("moviePoster.png")
			})
			.catch((err) => {
				console.warn("ERRRRROR")
				console.log(err)
			});
	}

	async function displayImage(url){
		try {
			//await downloadImage(imageURL, 'moviePoster.jpg');
			await gatherImage(url);
	
			// Check if file exists and has content before trying to display it
			const fs = require('fs');
			if (fs.existsSync(__dirname + '/moviePoster.png') && 
				fs.statSync(__dirname + '/moviePoster.png').size > 0) {
				
				var image = fs.readFileSync(__dirname + '/moviePoster.png');
				console.png(image);
			} else {
				console.log("Image file not created properly - skipping display".yellow);
			}
		} catch (error) {
			console.log("Unable to display image: " + error.message);
		}
	}

	try {
		displayImage(imageURL)
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
	console.log("Checking ".cyan + seatToCheck.cyan);

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

		await browser.close();
		return status

	} catch (error) {
		console.warn("Error in checkSeat function")
		console.log(error.message);
		await browser.close();
	}

}

const ReserveBufferSeats = async (firstBufferSeat, secondBufferSeat, url) => {	
	console.log('');
	console.log("Reserving seats".cyan)

	//Initialize browser for reserving seats
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



	//Buffer Seat 1
	try {
		const bufferSeat1 = await page.waitForSelector("#" + firstBufferSeat);
		if (bufferSeat1) {
			await bufferSeat1.click();
			console.log("✔️  Buffer Seat 1 CLICKED: Success!");
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 1 SELECT ❌ ❌ ❌");
		}
		await sleep(1000)
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}
	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on Bufffer seat 1 TRY ❌ ❌ ❌");
		console.log(error.message);
	}

	//Buffer Seat 2
	try {
		const bufferSeat2 = await page.waitForSelector("#" + secondBufferSeat);
		if (bufferSeat2) {
			await bufferSeat2.click();
			console.log("✔️  Buffer Seat 2 CLICKED: Success!");
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 2 SELECT ❌ ❌ ❌");
		}
		await sleep(1000)
		function sleep(ms) {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		}
	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on Buffer seat 2 TRY ❌ ❌ ❌");
		console.log(error.message);
	}

	//Check for 2 buffer seats selected
	try {
		const checkSeats = await page.waitForSelector("#stickyFooterSelectedCount");
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);
		console.log(seatValidatiion.replace());

		if (seatValidatiion === '0 Selected:') {
			console.log(' ⌛ Seats still reserved - looping to maintain... ⌛');
			await browser.close();
			console.log('====================================================================================');
			console.log('====================================================================================');
		}

		else {
			//Buffer seat clicks to complete - Press NEXT button to lock in
			const bufferSeatFirstNext = await page.waitForSelector("#NextButton");
			if (bufferSeatFirstNext) {
				await bufferSeatFirstNext.click();

				const bufferSeatSecondNext = await page.waitForSelector("#ticket-selection-overlay-next-btn");
				if (bufferSeatSecondNext) {
					await bufferSeatSecondNext.click();
					console.log(" ✅ Buffer Seat selection COMPLETE! ✅");
				}
				else {
					console.log("❌ ❌ ❌ ERROR on Buffer Seat Second Next ❌ ❌ ❌");
				}
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Buffer First Next ❌ ❌ ❌");
			}
			
			console.log("");

			await page.waitForSelector('#buynow-continue-btn', {
				visible: true,
			});

			const popupNextButton = await page.waitForSelector('#buynow-continue-btn', {visible: true})

			if(popupNextButton){
				await popupNextButton.click()
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Popup Next ❌ ❌ ❌");
			}

			const priceLOL = await page.waitForSelector("#purchaseTotal");
			const dollarsSaved = await page.evaluate(price => price.innerText, priceLOL);
			console.log("Price: " + dollarsSaved)

			// await page.screenshot({
			// 	path: "screenshots/screenshot.png",
			// 	fullPage: true
			// });

			await browser.close();
		}
		

	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on final step TRY ❌ ❌ ❌");
		console.log(error.message);
		await browser.close();
	}

}

const targetSeats = async (seats, url) => {	
	console.log('');
	console.log("Reserving seats".cyan)

	//Initialize browser for reserving seats
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

	for (const seat of seats){
		try {
			const targetSeat = await page.waitForSelector("#" + seat);
			if (targetSeat) {
				await targetSeat.click();
				console.log(`✔️  ${seat} CLICKED: Success!`);
			}
			else {
				console.log(`❌ ❌ ❌ ERROR selecting seat ${seat} ❌ ❌ ❌`);
			}
			await sleep(1000)
			function sleep(ms) {
				return new Promise((resolve) => {
					setTimeout(resolve, ms);
				});
			}
		} catch (error) {
			console.log(`❌ ❌ ❌ ERROR on seat ${seat} TRY ❌ ❌ ❌`);
			console.log(error.message);
		}
	}

	//Check for 2 buffer seats selected
	try {
		const checkSeats = await page.waitForSelector("#stickyFooterSelectedCount");
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);
		console.log(seatValidatiion.replace());

		if (seatValidatiion === '0 Selected:') {
			console.log(' ⌛ Seats still reserved - looping to maintain... ⌛');
			await browser.close();
			console.log('====================================================================================');
			console.log('====================================================================================');
		}

		else {
			//Buffer seat clicks to complete - Press NEXT button to lock in
			const bufferSeatFirstNext = await page.waitForSelector("#NextButton");
			if (bufferSeatFirstNext) {
				await bufferSeatFirstNext.click();

				const bufferSeatSecondNext = await page.waitForSelector("#ticket-selection-overlay-next-btn");
				if (bufferSeatSecondNext) {
					await bufferSeatSecondNext.click();
					console.log(" ✅ Seat Targetting selection COMPLETE! ✅");
				}
				else {
					console.log("❌ ❌ ❌ ERROR on Seat Targetting Second Next ❌ ❌ ❌");
				}
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Seat Targetting First Next ❌ ❌ ❌");
			}
			
			console.log("");

			await page.waitForSelector('#buynow-continue-btn', {
				visible: true,
			});

			const popupNextButton = await page.waitForSelector('#buynow-continue-btn', {visible: true})

			if(popupNextButton){
				await popupNextButton.click()
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Popup Next ❌ ❌ ❌");
			}

			const priceLOL = await page.waitForSelector("#purchaseTotal");
			const dollarsSaved = await page.evaluate(price => price.innerText, priceLOL);
			console.log("Price: " + dollarsSaved)

			// await page.screenshot({
			// 	path: "screenshots/screenshot.png",
			// 	fullPage: true
			// });

			await browser.close();
		}
		

	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on final Seat Targetting TRY ❌ ❌ ❌");
		console.log(error.message);
		await browser.close();
	}

}

const bufferLoop = async (startSeat, endSeat, url) => {

	var todaysDate = new Date()

	await movieInfo(url);

	if (!!showTime) {
		if (todaysDate.getTime() < showTime.getTime())
			console.log("Show has not happened yet: Initiating loop".magenta);
		else
			console.log("Show has happened at " + todaysDate);
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
		console.log("Loop began at: ".cyan + loopTime)
		//Check that seats are availiable
		var seatCheck1 = await checkSeat(url, firstBufferSeat)
		var seatCheck2 = await checkSeat(url, secondBufferSeat)

		if (seatCheck1.includes("Open") && seatCheck2.includes("Open")) {
			await ReserveBufferSeats(firstBufferSeat, secondBufferSeat, url)
			console.log("Aquired both seats, Looping to maintain reservation".magenta)
		}

		else if (seatCheck1.includes("Unavailable") || seatCheck2.includes("Unavailable")) { //
			console.log(firstBufferSeat.magenta + ": ".magenta  + seatCheck1.magenta  + " - ".magenta + secondBufferSeat.magenta  + ": ".magenta  + seatCheck2.magenta )
			console.log("Looping to aquire seats... Unsuccessful".red)
		}

		else {
			console.log("Error checking for seat availiability".red)
			console.log("Looping from an ERROR STATE to check seat availiability".red)
		}
		console.log('');
		console.log('-------------------------------------------------'.zebra);
		await new Promise(resolve => setTimeout(resolve, 45000));
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
			console.log("Show has not happened yet: Initiating loop".magenta);
		else
			console.log("Show has happened at " + todaysDate);
	}

	//Loops every 30 seconds until showtime passes
	while (todaysDate.getTime() < showTime.getTime()) {
		var loopTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
		console.log('');
		console.log("Loop began at: ".cyan + loopTime)
		//Check that seats are availiable
		var seatCheck = await checkSeat(url, seats[0])

		if (seatCheck.includes("Open") ) {
			await targetSeats(seats, url)
			console.log("Aquired both seats, Looping to maintain reservation".magenta)
		}

		else if (seatCheck.includes("Unavailable") ) { //
			console.log(seats[0].magenta + ": ".magenta  + seatCheck.magenta)
			console.log("Looping to acquire seats... Unsuccessful".red)
		}

		else {
			console.log("Error checking for seat availiability".red)
			console.log("Looping from an ERROR STATE to check seat availiability".red)
		}
		console.log('');
		console.log('-------------------------------------------------'.zebra);
		await new Promise(resolve => setTimeout(resolve, 45000));
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
        console.log("Usage:");
        console.log("  node CinemaSafe.js Buffer <url> <startSeat> <endSeat>");
        console.log("  node CinemaSafe.js Target <url> <seat1,seat2,...>");
        console.log("  node CinemaSafe.js -mode Buffer -url <url> -startSeat <startSeat> -endSeat <endSeat>");
        console.log("  node CinemaSafe.js -mode Target -url <url> -seats <seat1,seat2,...>");
        process.exit(1);
    }
} else {
    // ...existing menu system...
    (async () => {
        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Mode select:',
            choices: [
                { title: 'Buffer Mode', description: 'Create buffer zone around a group of seats', value: 'Buffer' },
                //{ title: 'Green', value: '#00ff00', disabled: true },
                { title: 'Target Mode', description: 'Target a list up to 20 seats, may be non-sequential', value: 'Target' }
            ],
            initial: 1
        });

        console.log(''); 

        if (response.value.includes("Buffer")) {
            const link = await prompts({
                type: 'text',
                name: 'value',
                message: `Fandango Link: (link from seat selection page)`,
                validate: value => !value.includes("https://tickets.fandango.com/") ? `Link should start with: https://tickets.fandango.com/` : true
            });

            console.log(''); 
            const startSeat = prompt("START seat: ");
            const endSeat = prompt("END seat: ");
            console.log(''); 
            bufferLoop(startSeat, endSeat, link.value);
        }	console.log('');

        if (response.value.includes("Target")) {
            const link = await prompts({
                type: 'text',
                name: 'value',
                message: `Fandango Link: (link from seat selection page)`.cyan,
                validate: value => !value.includes("https://tickets.fandango.com/") ? `Link should start with: https://tickets.fandango.com/` : true
            });
            console.log(''); 
            const seats = await prompts({
                type: 'list',
                name: 'targets',
                message: 'Enter up to 20 targets (comma seperated): ',
                initial: '',
                separator: ','
            });

            console.log(''); 
            const uppercaseSeats= seats.targets.map(targets => targets.toUpperCase());
            targetLoop(uppercaseSeats, link.value);
        }
    })();
}





//ReserveBufferSeats(startSeat, endSeat, link);
// a1,b4,c5,d6,e7,a5,b6,d4,e3
