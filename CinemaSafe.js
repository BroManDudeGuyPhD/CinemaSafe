const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const cheerio = require("cheerio");
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

console.log('===================================================================================');
console.log(' ██████╗██╗███╗   ██╗███████╗███╗   ███╗ █████╗ ███████╗ █████╗ ███████╗███████╗');
console.log('██╔════╝██║████╗  ██║██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔════╝');
console.log('██║     ██║██╔██╗ ██║█████╗  ██╔████╔██║███████║███████╗███████║█████╗  █████╗  ');
console.log('██║     ██║██║╚██╗██║██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║██╔══██║██╔══╝  ██╔══╝  ');
console.log('╚██████╗██║██║ ╚████║███████╗██║ ╚═╝ ██║██║  ██║███████║██║  ██║██║     ███████╗');
console.log(' ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝');
console.log('====================================================================================');

const movieInfo = async (startSeat, endSeat, url) => {
	//Seat Logic (determine how many seats and what buffer seats are)

	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
	let amountToBuffer = (endSeatNumber - startSeatNumber) + 1;
	var row = startSeat.replace(/[^a-zA-Z]+/g, '');
	/*
	switch(endSeatNumber-startSeatNumber){
		case 0: 
			console.log('One seat to buffer');
			break;
		case 1:
			console.log('1');
			break;
		
	}
	*/

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

		console.log("Status code:", response.status());
	} catch (error) {
		console.log(error.message);
	}

	const [getTitle] = await page.$x('//*[@id="MovieInfoSection"]/div[1]/div/div/h2');
	const title = await page.evaluate(name => name.innerText, getTitle);
	console.log('Title: ' + title);

	const [getShowTime] = await page.$x('//*[@id="MovieInfoSection"]/div[2]/h3');
	const time = await page.evaluate(name => name.innerText, getShowTime);
	console.log('Showime: ' + time);

	const [getTheatre] = await page.$x('//*[@id="MovieInfoSection"]/div[1]/div/div/h3');
	const theatre = await page.evaluate(name => name.innerText, getTheatre);
	console.log('Theatre: ' + theatre);

	const [getAddress] = await page.$x('//*[@id="MovieInfoSection"]/div[1]/div/div/p[2]');
	const address = await page.evaluate(name => name.innerText, getAddress);
	console.log('Address: ' + address);

	const [getPoster] = await page.$x('//*[@id="MovieInfoSection"]/div[1]/div/img');
	const jsHandle = await getPoster.getProperty('src');
	const plainValue = await jsHandle.jsonValue();
	console.log("Poster: " + plainValue);

}

const reserveSeats = async (startSeat, endSeat, url) => {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 60000
		});

		console.log("Status code:", response.status());
	} catch (error) {
		console.log(error.message);
	}


	const [getShowTime] = await page.$x('//*[@id="MovieInfoSection"]/div[2]/h3');
	const time = await page.evaluate(name => name.innerText, getShowTime);

	//Seat Logic (determine how many seats and what buffer seats are)
	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
	let amountToBuffer = (endSeatNumber - startSeatNumber) + 1;
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


	try {
		const [ticketButton] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/button[2]');
		if (ticketButton) {
			await ticketButton.click();
			await page.keyboard.press('Space');

			const [selected] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/div');
			const selectedNumber = await page.evaluate(name => name.innerText, selected);

			const onlyNumbers = selectedNumber.replace(/\D/g, '');
			if (onlyNumbers === '2') {
				console.log('✔️  Ticket selection: Success! ');
			}
			if (onlyNumbers === '1') {
				await page.keyboard.press('Space');

				const [selected2] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/div');
				const selectedNumber2 = await page.evaluate(name => name.innerText, selected);
				if (onlyNumbers === '2') {
					console.log('✔️  Ticket selection: Success! (Error 1 tickets remediated)');
				}
				else {
					console.log('Breaking change: ' + onlyNumbers + ' ticket selected...need 2');
				}
			}
			if (onlyNumbers === '0') {
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Space');
				await page.keyboard.press('Space');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				await page.keyboard.press('Tab');
				console.log('✔️  Ticket selection: Success! (Error 0 tickets remediated)');
			}

			//console.log(selectedNumber);
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Ticket Select: Button not defined");
		}
	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on Ticket Select TRY ❌ ❌ ❌");
		console.log(error.message);
	}



	try {
		//Click next button after selecting Tickets
		const [nextButton] = await page.$x("//button[contains(., 'Next')]");
		if (nextButton) {
			await nextButton.click();
			console.log("✔️  Next Page: Success!");
		}
		else {
			console.log("❌ ❌ ❌ ERROR on Next Page Navigation ❌");
		}
	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on Ticket Select TRY ❌ ❌ ❌");
		console.log(error.message);
	}


	await page.waitForNavigation({
		waitUntil: 'networkidle0',
		timeout: 60000,
	});


	await sleep(5000)
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

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
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 1 ❌");
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
			console.log("❌ ❌ ❌ ERROR on Buffer Seat 2 ❌");
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
			const [bufferSeatComplete] = await page.$x('//*[@id="NextButton"]');
			if (bufferSeatComplete) {
				await bufferSeatComplete.click();
				console.log(" ✅ Buffer Seat selection COMPLETE! ✅");
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Buffer Seat Complete ❌");
			}

			await page.waitForNavigation({
				waitUntil: 'networkidle0',
				timeout: 60000,
			});

			console.log("...");
			console.log("...");
			//Check for 2 buffer seats selected
			const [checkout] = await page.$x('//*[@id="SeatSelectionSection"]/div[2]/a');
			const checkoutLOL = await page.evaluate(name => name.innerText, checkout);
			console.log(checkoutLOL);


			/*
						await page.screenshot({
							path: "screenshots/screenshot.png",
							fullPage: true
						});
			*/
			await browser.close();

		}

	} catch (error) {
		console.log("❌ ❌ ❌ ERROR on final step TRY ❌ ❌ ❌");
		console.log(error.message);
	}

}

const prompt = require("prompt-sync")({ sigint: true });
const link = prompt("Fandango Link: ");
const startSeat = prompt("START seat: ");
const endSeat = prompt("END seat: ");
console.log(`Buffering ${startSeat} and ${endSeat}`);

movieInfo(startSeat, endSeat, link);
reserveSeats(startSeat, endSeat, link);
//Loops once a minute
setInterval(function () {
	reserveSeats(startSeat, endSeat, link);
}, 60000);




