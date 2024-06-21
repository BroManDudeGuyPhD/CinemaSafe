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

require('console-png').attachTo(console);
colors.enable()


puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

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

const movieInfo = async (startSeat, endSeat, url) => {

	//Web Initialization
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	try {
		var response = await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 60000
		});

		
	} catch (error) {
		console.log("Status code:", response.status());
		console.log(error.message);
	}

	const getTitle = await page.waitForSelector('#ShowtimeTitleLink');
	const title = await page.evaluate(name => name.innerText, getTitle);

	console.log('Title: ' + title.cyan);

	const getShowTime = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__date.dark__section');
	const time = await page.evaluate(name => name.innerText, getShowTime);

	if (!!time) {
		var todaysDate = new Date()
		var currentYear = todaysDate.getFullYear()
		let atRemove = time.replace("at", "");
		var dateTime = atRemove.split(",")
		var date = dateTime[1].trim() + currentYear;
		showTime = new Date(date);
	}
	console.log('Showime: ' + time.cyan);

	const getTheatre = await page.waitForSelector('#HeaderTitleWrapper > div > div > div > p.showtime-info__theater.dark__section');
	const theatre = await page.evaluate(name => name.innerText, getTheatre);
	console.log('Theatre: ' + theatre.cyan);

	// const getAddress = await page.waitForSelector('#ShowtimeTitleLink');
	// const address = await page.evaluate(name => name.innerText, getAddress);
	// console.log('Address: ' + address);

	const getPoster = await page.waitForSelector('#HeaderTitleWrapper > div > div > a > img');
	const jsHandle = await getPoster.getProperty('src');
	const imageURL = await jsHandle.jsonValue();
	
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
		//await downloadImage(imageURL, 'moviePoster.jpg');
		await gatherImage(url);

		var image = require('fs').readFileSync(__dirname + '/moviePoster.png');
		console.png(image);
	}

	await displayImage(imageURL)

	//Clean up browser
	await browser.close();

	//await new Promise(resolve => setTimeout(resolve, 5000));

	console.log('');
	console.log('==================================================================================='.cyan);
	console.log('*****     +     +     + Commencing Target Acquisition +     +     +     +     *****'.cyan.bgMagenta);
	console.log('==================================================================================='.cyan);
	console.log('');
	//statusBAR();

}

async function checkSeat(url, seatToCheck) {
	console.log("Checking ".cyan + seatToCheck.cyan);

	var status = "Error"
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');

	try {
		var response = await page.goto(url, {
			waitUntil: "load",
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
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36');
	
	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle0",
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

const mainLoop = async (startSeat, endSeat, url) => {

	var todaysDate = new Date()

	await movieInfo(startSeat, endSeat, url);

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

const prompt = require("prompt-sync")({ sigint: true });
//const menuSelection = prompt("CinemaSafe.js ");

var showTime
const link = prompt("Fandango Link: ");
const startSeat = prompt("START seat: ");
const endSeat = prompt("END seat: ");
console.log(`Buffering ${startSeat} and ${endSeat}`);

mainLoop(startSeat, endSeat, link);

//ReserveBufferSeats(startSeat, endSeat, link);
