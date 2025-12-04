const zeroPad = (n, digits) => n.toString().padStart(digits, '0');

const url = new URL(window.location.href);

const TOTAL_ALIGNERS = url.searchParams.get('total_aligners');
const startDatesRaw = url.searchParams.get('start_dates');
const changeIntervalsRaw = url.searchParams.get('change_intervals');

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const $error = document.getElementById('error');
const $errorMessage = document.getElementById('error-message');
const $replaceWarning = document.getElementById('replace-warning');
const $replaceInDays = document.getElementById('replace-in-days');
const $replaceDate = document.getElementById('replace-date');
const $current = document.getElementById('current');
const $total = document.getElementById('total');
const $percent = document.getElementById('percent');
const $daysPassed = document.getElementById('days-passed');
const $daysTotal = document.getElementById('days-total');
const $mainBlock = document.getElementById('main-block');
const $completedBlock = document.getElementById('completed-block');

main();

function showError(message) {
	$errorMessage.textContent = message;
	$error.style.display = 'block';
}

function getCurrentPeriodIndex(startDates) {
	const currentDate = new Date();
	for (let i = (startDates.length - 1); i >= 0; i--) {
		const date = new Date(startDates[i]);
		if (date < currentDate) {
			return i;
		}
	}
	return -1;
}

function getPreviousData(allStartDates, allChangeIntervals, indexOfCurrentPeriod) {
	const startDates = allStartDates.slice(0, indexOfCurrentPeriod + 1);
	const changeIntervals = allChangeIntervals.slice(0, indexOfCurrentPeriod + 1);

	if (startDates.length === 1) {
		return { allPreviousDays: 0, allPreviousAlignersCount: 0 };
	}

	let allPreviousDays = 0;
	let allPreviousAlignersCount = 0;

	for (let i = 1; i < startDates.length; i++) {
		const startTime = new Date(startDates[i - 1]).getTime();
		const nextStartTime = new Date(startDates[i]).getTime();

		const changeInterval = changeIntervals[i - 1];

		const msCount = nextStartTime - startTime;
		const daysCount = Math.floor(msCount / MS_IN_DAY);
		const alignersCount = Math.round(daysCount / changeInterval);

		allPreviousDays += daysCount;
		allPreviousAlignersCount += alignersCount;
	}

	return { allPreviousDays, allPreviousAlignersCount };
}

function main() {
	if (!startDatesRaw || !changeIntervalsRaw || !TOTAL_ALIGNERS) {
		showError('not enough parameters');
		return;
	}

	const startDates = startDatesRaw.split(',');
	const changeIntervals = changeIntervalsRaw.split(',');

	if (startDates.length !== changeIntervals.length) {
		showError('incorrect parameters');
		return;
	}

	const indexOfCurrentPeriod = getCurrentPeriodIndex(startDates);

	if (indexOfCurrentPeriod < 0) {
		showError('all dates are in future');
		return;
	}

	const startDate = new Date(startDates[indexOfCurrentPeriod]);
	const startTime = startDate.getTime();
	const currentDate = new Date();
	const currentTime = currentDate.getTime();

	const msInUse = currentTime - startTime;
	const { allPreviousDays, allPreviousAlignersCount } = getPreviousData(startDates, changeIntervals, indexOfCurrentPeriod);
	const currentTotalDaysInUse = Math.floor(msInUse / MS_IN_DAY);
	const totalDaysInUse = allPreviousDays + currentTotalDaysInUse;

	const changeInterval = changeIntervals[indexOfCurrentPeriod];

	const currentAlignerIndex = Math.floor(currentTotalDaysInUse / changeInterval) + 1 + allPreviousAlignersCount;
	const totalDays = allPreviousDays + (TOTAL_ALIGNERS - allPreviousAlignersCount) * changeInterval;
	const activeDays = currentTotalDaysInUse % changeInterval;
	const replaceInDays = changeInterval - activeDays;

	const lastReplaceTime = currentTime - (msInUse % (MS_IN_DAY * changeInterval));
	const replaceTime = lastReplaceTime + MS_IN_DAY * changeInterval;
	const replaceDate = new Date(replaceTime);

	const percent = totalDaysInUse / (totalDays / 100);

    const completed = totalDaysInUse >= totalDays;

    $percent.textContent = (percent > 100 ? 100 : percent.toFixed(1));
    $daysPassed.textContent = totalDaysInUse.toString();
    $daysTotal.textContent = totalDays.toString();

    if (completed) {
        $mainBlock.style.display = 'none';
        $completedBlock.style.display = 'block';
        return;
    }

    if (activeDays === 0) {
		$replaceWarning.style.display = 'block';
	}

	$current.textContent = currentAlignerIndex.toString();
	$total.textContent = TOTAL_ALIGNERS;

	$replaceInDays.textContent = replaceInDays.toString();
	const day = zeroPad(replaceDate.getDate(), 2);
	const month = zeroPad(replaceDate.getMonth() + 1, 2);
	const year = replaceDate.getFullYear();
	$replaceDate.textContent = `${day}.${month}.${year}`;
}
