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
const punycode = require('punycode'); 

require('console-png').attachTo(console);
colors.enable()


puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

console.clear(); 
console.log('===================================================================================');
console.log(' ██████╗██╗███╗   ██╗███████╗███╗   ███╗ █████╗ ███████╗ █████╗ ███████╗███████╗');
console.log('██╔════╝██║████╗  ██║██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝');
console.log('██║     ██║██╔██╗ ██║█████╗  ██╔████╔██║███████║███████╗███████║█████╗  █████╗  ');
console.log('██║     ██║██║╚██╗██║██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══╝  ');
console.log('╚██████╗██║██║ ╚████║███████╗██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║     ███████╗');
console.log(' ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝');
console.log('====================================================================================');

console.log(

		figlet.textSync('CINEMA-SAFE', { horizontalLayout: 'full' }).cyan
);

const movieInfo = async (startSeat, endSeat, url) => {
	//Seat Logic (determine how many seats and what buffer seats are)

	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
	let amountToBuffer = (endSeatNumber - startSeatNumber) + 1;
	var row = startSeat.replace(/[^a-zA-Z]+/g, '');

	console.log('You have selected ' + amountToBuffer + ' seats on row ' + row);


	//Web Initialization
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 60000
		});

		
	} catch (error) {
		console.log("Status code:", response.status());
		console.log(error.message);
	}

	const [getTitle] = await page.$x('//*[@id="ShowtimeTitleLink"]');
	const title = await page.evaluate(name => name.innerText, getTitle);
	console.log('Title: ' + title.cyan);

	const [getShowTime] = await page.$x('/html/body/div[1]/div[2]/div[1]/header/div[2]/div/div/div/p[1]');
	const time = await page.evaluate(name => name.innerText, getShowTime);
	console.log('Showime: ' + time.cyan);

	const [getTheatre] = await page.$x('/html/body/div[1]/div[2]/div[1]/header/div[2]/div/div/div/p[2]');
	const theatre = await page.evaluate(name => name.innerText, getTheatre);
	console.log('Theatre: ' + theatre.cyan);

	//const [getAddress] = await page.$x('//*[@id="MovieInfoSection"]/div[1]/div/div/p[2]');
	//const address = await page.evaluate(name => name.innerText, getAddress);
	//console.log('Address: ' + address);

	const [getPoster] = await page.$x('/html/body/div[1]/div[2]/div[1]/header/div[2]/div/div/a/img');
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
		const convertImages = await gatherImage(url);

		var image = require('fs').readFileSync(__dirname + '/moviePoster.png');
		console.png(image);
	}

	await displayImage(imageURL)

	//Clean up browser
	await browser.close();

	//await new Promise(resolve => setTimeout(resolve, 5000));

	console.log('');
	console.log('==================================================================================='.magenta);
	console.log('*****     +     +     + Commencing Target Acquisition +     +     +     +     *****'.cyan);
	console.log('==================================================================================='.magenta);
	console.log('');
	//statusBAR();

	//Loops once a minute
	FandangoReserveSeats(startSeat, endSeat, link);
	setInterval(function () {
		FandangoReserveSeats(startSeat, endSeat, link);
	}, 60000);

}

const FandangoReserveSeats = async (startSeat, endSeat, url) => {
	console.log("Reserving seats".cyan)

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

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


	const [getShowTime] = await page.$x('/html/body/div[1]/div[2]/div[1]/header/div[2]/div/div/div/p[1]');
	const time = await page.evaluate(name => name.innerText, getShowTime);

	//Seat Logic (determine how many seats and what buffer seats are)
	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
	let amountToBuffer = (endSeatNumber - startSeatNumber) + 1;
	startSeat = startSeat.toUpperCase();
	var row = startSeat.replace(/[^a-zA-Z]+/g, '');
	var todaysDate = new Date()
	var currentYear = todaysDate.getFullYear()

	let atRemove = time.replace("at", "");
	var dateTime = atRemove.split(",")
	let showTime = dateTime[1].trim() + currentYear;
	var date = new Date(showTime);


	if (todaysDate.getTime() < date.getTime())
		console.log("Show has not happened yet: Keep looping");
	else
		console.log("Show has happened at " + todaysDate);


	console.log('');



	//const [getSeats] = await page.$x('//*[@id="svg-Layer_1"]');

	var firstBufferSeat = +startSeatNumber - 1
	var secondBufferSear = +endSeatNumber + 1

	//Buffer Seat 1
	try {
		const [bufferSeat1] = await page.$x('//*[@id="' + row + firstBufferSeat + '"]');
		if (bufferSeat1) {
			await bufferSeat1.click();
			console.log("✔️  Buffer Seat 1 CLICKED: Success!");
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 1 ❌ ❌ ❌");
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
		const [bufferSeat2] = await page.$x('//*[@id="' + row + secondBufferSear + '"]');
		if (bufferSeat2) {
			await bufferSeat2.click();
			console.log("✔️  Buffer Seat 2 CLICKED: Success!");
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 2 ❌ ❌ ❌");
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
		const [checkSeats] = await page.$x('//*[@id="selectedSeatIDs"]/div');
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);
		console.log(seatValidatiion);

		if (seatValidatiion === '0 Selected:') {
			console.log(' ⌛ Seats still reserved - looping to maintain... ⌛');
			await browser.close();
			console.log('====================================================================================');
			console.log('====================================================================================');
		}

		else {
			//Buffer seats complete - NEXT button to lock in
			const [bufferSeatFirstNext] = await page.$x('//*[@id="NextButton"]');
			if (bufferSeatFirstNext) {
				await bufferSeatFirstNext.click();

				const [bufferSeatSecondNext] = await page.$x('//*[@id="ticket-selection-overlay-next-btn"]');
				if (bufferSeatSecondNext) {
					await bufferSeatSecondNext.click();

					
					console.log(" ✅ Buffer Seat selection COMPLETE! ✅");
				}
				else {
					console.log("❌ ❌ ❌ ERROR on Buffer Seat First Next ❌ ❌ ❌");
				}
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Buffer Second Next ❌ ❌ ❌");
			}

			

			console.log("...");
			console.log("...");

			await page.waitForSelector('#buynow-continue-btn', {
				visible: true,
			});
			
			//Check for 2 buffer seats selected
			
			const [checkout] = await page.$x('//*[@id="buynow-continue-btn"]');
			await checkout.click();
			//const checkoutLOL = await this.page.evaluate(() => document.body.querySelector('h1').textContent);

			const priceLOL = await await page.$x('//*[@id="purchaseTotal"]');
			console.log("Price: "+priceLOL);


			
						await page.screenshot({
							path: "screenshots/screenshot.png",
							fullPage: true
						});
			
			await browser.close();

		}

	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on final step TRY ❌ ❌ ❌");
		console.log(error.message);
	}

}

const prompt = require("prompt-sync")({ sigint: true });
//const menuSelection = prompt("CinemaSafe.js ");

const link = prompt("Fandango Link: ");
const startSeat = prompt("START seat: ");
const endSeat = prompt("END seat: ");
console.log(`Buffering ${startSeat} and ${endSeat}`);

movieInfo(startSeat, endSeat, link);

//FandangoReserveSeats(startSeat, endSeat, link);
