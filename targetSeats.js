const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cheerio = require("cheerio");
//puppeteer.use(StealthPlugin());

const FandangotargetSeats = async (startSeat, endSeat, url) => {

	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setCacheEnabled(false);
	page.setViewport({ width: 1280, height: 926 });

	try {
		const response = await page.goto(url, {
			waitUntil: "networkidle0",
			timeout: 90000
		});

	} catch (error) {
		console.log(error.message);
		console.log("Status code:", response.status());
	}


	//await page.goto(url);
	const [getShowTime] = await page.$x('//*[@id="MovieInfoSection"]/div[2]/h3');
	const time = await page.evaluate(name => name.innerText, getShowTime);
	//console.log(time);


	//Seat Logic (determine how many seats and what buffer seats are)
	const startSeatNumber = startSeat.replace(/\D/g, '');
	const endSeatNumber = endSeat.replace(/\D/g, '');
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


	let targetCounter = (endSeatNumber - startSeatNumber); //This selects one less than actually targeted
	const [ticketButton] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/button[2]');
	if (ticketButton) {

		//Initial button click to start seat selection - pressing the space key is easier after this
		await ticketButton.click();

		//Loops for as many seats are needed - presses space n-1 because initial click provides first ticket
		for (let i = 0; i < targetCounter; i++) {
			await page.keyboard.press('Space');
		}

		const [selected] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/div');
		const selectedNumber = await page.evaluate(name => name.innerText, selected);
		const onlyNumbers = selectedNumber.replace(/\D/g, '');
		targetCounter += 1;
		if (onlyNumbers === targetCounter) {
			console.log('✔️  Ticket selection: Success! Preparing to select ' + onlyNumbers + ' seats');
		}
		if (onlyNumbers === '1') {
			await page.keyboard.press('Space');

			const [selected2] = await page.$x('//*[@id="TicketSelectionSection"]/div[2]/ul/li[1]/div[2]/div');
			const selectedNumber2 = await page.evaluate(name => name.innerText, selected);
			if (onlyNumbers === selectedNumber) {
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
		console.log("❌ ❌ ❌ ERROR on Ticket Select finding ticket button");
	}

	//Click next button after selecting Tickets
	const [nextButton] = await page.$x("//button[contains(., 'Next')]");
	if (nextButton) {
		await nextButton.click();
		console.log("✔️ Next Page: Success!");
	}
	else {
		console.log("❌ ❌ ❌ ERROR on Next Page Navigation ❌");
	}

	await page.waitForNavigation({
		waitUntil: 'networkidle0',
	});

	await sleep(30000)
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}



	//const [getSeats] = await page.$x('//*[@id="svg-Layer_1"]');

	//Buffer Seat 1
	/*
			const [bufferSeat1] = await page.$x('//*[@id="'+row+firstBufferSeat+'"]');
			if (bufferSeat1) {
				await bufferSeat1.click();
				console.log("✔️  Buffer Seat 1 CLICKED: Success!");
			}
			else{
				console.log("❌ ❌ ❌ ERROR on Buffer Seat 1 ❌");
			}
			await sleep(1000)
			function sleep(ms) {
				return new Promise((resolve) => {
				setTimeout(resolve, ms);
				});
			}
	
			//Buffer Seat 2
			const [bufferSeat2] = await page.$x('//*[@id="'+row+secondBufferSear+'"]');
			if (bufferSeat2) {
				await bufferSeat2.click();
				console.log("✔️  Buffer Seat 2 CLICKED: Success!");
			}
			else{
				console.log("❌ ❌ ❌ ERROR on Buffer Seat 2 ❌");
			}
			await sleep(1000)
			function sleep(ms) {
				return new Promise((resolve) => {
				setTimeout(resolve, ms);
				});
			}
	*/
	try {

		var seatCounter = 1;
		var counter = 0;
		//for (var i = startSeatNumber; i <= endSeatNumber; i++) {
		while (counter < targetCounter) {
			var seatNumber = targetCounter - counter;
			console.log(seatCounter);
			const [bufferSeat] = await page.$x('//*[@id="' + row + seatNumber + '"]');
			if (bufferSeat) {
				await bufferSeat.click();
				console.log("✔️  Seat " + seatCounter + " CLICKED: Success!");
			}
			else {
				console.log("❌ ❌ ❌ ERROR clicking seat " + seatCounter + " ❌");
			}
			seatCounter++;
			counter++;
			await sleep(500)
			function sleep(ms) {
				return new Promise((resolve) => {
					setTimeout(resolve, ms);
				});
			}
		}
		//console.log('Seats clicked');
	} catch (error) {
		console.log(error.message);
	}

	try {
		//Check for 2 buffer seats selected 
		console.log('CHecking seats');
		const [checkSeats] = await page.$x('//*[@id="SeatSelectionSection"]/div[2]/a/span[2]');
		const seatValidatiion = await page.evaluate(name => name.innerText, checkSeats);
		console.log(seatValidatiion);

		if (seatValidatiion === '0 Selected:') {
			console.log('⌛ Seats still reserved - looping to maintain... ⌛  at ' + todaysDate);
			await browser.close();
			//console.log('====================================================================================');
		}

		else {
			//Buffer seats complete - NEXT button to lock in
			const [bufferSeatComplete] = await page.$x('//*[@id="NextButton"]');
			if (bufferSeatComplete) {
				await bufferSeatComplete.click();
				//console.log(" ✅ Buffer Seat selection COMPLETE! ✅");
			}

			else {
				console.log("❌ ❌ ❌ ERROR on Buffer Seat Complete ❌");
			}

			await page.waitForNavigation({
				waitUntil: 'networkidle0',
			});


			//Check for 2 buffer seats selected
			const [checkout] = await page.$x('//*[@id="SeatSelectionSection"]/div[2]/a');
			const checkoutLOL = await page.evaluate(name => name.innerText, checkout);

			if (checkoutLOL)
				console.log("✅ Buffer Seats SECURED! ✅");
			else
				console.log("❌ ❌ ❌ ERROR on final secure ❌");

			await browser.close();

		}

	} catch (error) {
		console.log(error.message);
	}

}


const ATOMtargetSeats = async (startSeat, endSeat, zip, theatre) => {
	//This is extremely similar to other functiions, but uses ATOM insteaf of Fandango
	//TODO - build a hybrid function that utilizes both to check and reserve, 

	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("https://www.atomtickets.com/"); //Atom is harder - You have to enter location on home screen so it requires a few more steps

	page.blockTrackers();

	const [locationDropdown] = await page.$x('/html/body/div[4]/div[3]/main/div[2]/div[3]/div/div[1]/div[2]/div/button');

	if (locationDropdown) {
		await locationDropdown.click();
		await page.type("70506");
		await page.keyboard.press('Enter');
		console.log('✔️ Success: Location');

	}
	else {
		console.log("❌ ❌ ❌ ERROR at Atom location setting");
	}

	const [theatreDropdown] = await page.$x('/html/body/div[4]/div[1]/nav/div/div[2]/div[2]/button');
	if (theatreDropdown) {

		await theatreDropdown.click();
		console.log('✔️ Success: Theatre');
		const [button] = await page.$x("//button[contains(., '" + theatre + "')]");
		if (button) {
			await button.click();
		}

	}
	else {
		console.log("❌ ❌ ❌ ERROR at Atom Theatre setting");
	}


	const [data] = await page.$x('/html/body/div[4]/div[4]/main/div/div[3]/div/ul/li[1]/div/div[1]/div[2]/h2/a');
	const Data = await page.evaluate(name => name.innerText, data);
	console.log(Data)

}

function statusBAR() {
	async function status() {
		/* using 20 to make the progress bar length 20 charactes, multiplying by 5 below to arrive to 100 */

		for (let i = 0; i <= 50; i++) {
			const dots = ".".repeat(i)
			const left = 50 - i
			const empty = " ".repeat(left)

			/* need to use  `process.stdout.write` becuase console.log print a newline character */
			/* \r clear the current line and then print the other characters making it looks like it refresh*/
			process.stdout.write(`\r[${dots}${empty}] ${i * 2}%`)
			await wait(600)
		}
		//New Line after staus bar
		console.log('');
	}

	status()

	function wait(ms) {
		return new Promise(res => setTimeout(res, ms))
	}
}


/*
const prompt = require("prompt-sync")({ sigint: true });
const link = prompt("Fandango Link: " );
const startSeat = prompt("START seat: " );
const endSeat = prompt("END seat: " );
*/

//Hard coding variables

const link = "";
const startSeat = "D7";
const endSeat = "D8";


movieInfo(startSeat, endSeat, link);

//FandangotargetSeats(startSeat, endSeat, link);
setInterval(function () {
	FandangotargetSeats(startSeat, endSeat, link);
	//FandangoreserveSeats(startSeat, endSeat, link);
}, 10000);


//targetSeatsATOM(startSeat, endSeat,70506,"Grand 16");



