const zeroPad = (n, digits) => n.toString().padStart(digits, '0');

const url = new URL(window.location.href);

const START_DATE = url.searchParams.get('start_date');
const CHANGE_INTERVAL = url.searchParams.get('change_interval');
const TOTAL_ALIGNERS = url.searchParams.get('total_aligners');

const MS_IN_DAY = 1000 * 60 * 60 * 24;

document.addEventListener('DOMContentLoaded', () => {
	const $error = document.getElementById('error');
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

	if (!START_DATE || !CHANGE_INTERVAL || !TOTAL_ALIGNERS) {
		$error.style.display = 'block';
		return;
	}

	const startDate = new Date(START_DATE);
	const startTime = startDate.getTime();
	const currentDate = new Date();
	const currentTime = currentDate.getTime();

	const msInUse = currentTime - startTime;
	const totalDaysInUse = Math.floor(msInUse / MS_IN_DAY);

	const currentAlignerIndex = Math.floor(totalDaysInUse / CHANGE_INTERVAL) + 1;
	const totalDays = TOTAL_ALIGNERS * CHANGE_INTERVAL;
	const activeDays = totalDaysInUse % CHANGE_INTERVAL;
	const replaceInDays = CHANGE_INTERVAL - activeDays;

	const lastReplaceTime = currentTime - (msInUse % (MS_IN_DAY * CHANGE_INTERVAL));
	const replaceTime = lastReplaceTime + MS_IN_DAY * CHANGE_INTERVAL;
	const replaceDate = new Date(replaceTime);

    const percent = totalDaysInUse / (totalDays / 100);

    const completed = totalDaysInUse >= totalDays;

    $percent.textContent = (percent > 100 ? 100 : percent).toFixed(1);
    $daysPassed.textContent = totalDaysInUse;
    $daysTotal.textContent = totalDays;

    if (completed) {
        $mainBlock.style.display = 'none';
        $completedBlock.style.display = 'block';
        return;
    }

    if (activeDays === 0) {
		$replaceWarning.style.display = 'block';
	}

	$current.textContent = currentAlignerIndex;
	$total.textContent = TOTAL_ALIGNERS;

	$replaceInDays.textContent = replaceInDays;
	const day = zeroPad(replaceDate.getDate(), 2);
	const month = zeroPad(replaceDate.getMonth() + 1, 2);
	const year = replaceDate.getFullYear();
	$replaceDate.textContent = `${day}.${month}.${year}`;
});