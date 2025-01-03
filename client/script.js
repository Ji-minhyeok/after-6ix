document.getElementById("fetchWeather").addEventListener("click", async () => {
    const weatherResults = document.getElementById("weatherResults");
    weatherResults.innerHTML = "날씨 정보를 불러오는 중...";

    try {
        // 요청 시각을 기반으로 base_date, base_time 생성
        const currentTime = new Date();
        const baseDate = currentTime.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
        let baseTime = currentTime.getHours();
        let minutes = currentTime.getMinutes();
    
        // 45분 미만일 경우, 1시간 전의 데이터로 설정
        if (minutes < 45) {
            baseTime = baseTime - 1; // 1시간 전 데이터
            if (baseTime < 0) {
                baseTime = 23; // 0시 이전은 23시로 설정
                // 날짜도 1일 전으로 설정
                currentTime.setDate(currentTime.getDate() - 1); // 날짜 1일 전으로 변경
            }
        }
    
        // baseDate를 업데이트하여 날짜가 1일 전으로 변경된 경우 반영
        const updatedBaseDate = currentTime.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
        // baseTime을 4자리로 맞추기 (시:30 형식으로 변환)
        baseTime = baseTime < 10 ? '0' + baseTime + '30' : baseTime + '30'; // 4자리로 맞추기
    

        // 고정된 nx, ny
        const queryStringParameters = {
            base_date: baseDate,
            base_time: baseTime,
            nx: "55",
            ny: "127",
        };

        // Lambda 함수의 엔드포인트
        const lambdaEndpoint = "https://jpdo02170i.execute-api.ap-northeast-2.amazonaws.com/after6ix-stage";

        // Lambda 함수 호출
        const response = await fetch(
            `${lambdaEndpoint}?base_date=${queryStringParameters.base_date}&base_time=${queryStringParameters.base_time}&nx=${queryStringParameters.nx}&ny=${queryStringParameters.ny}`
        );

        if (!response.ok) {
            throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
        }

        const weatherData = await response.json();
        console.log(weatherData); // 데이터 구조 확인
        displayWeatherData(weatherData);
    } catch (error) {
        weatherResults.innerHTML = `<p class="error">${error.message}</p>`;
    }
});

// 날씨 데이터를 화면에 표시하는 함수
function displayWeatherData(weatherData) {
    const weatherResults = document.getElementById("weatherResults");

    // 응답 구조 확인 후 'items'가 존재하는지 체크
    if (!weatherData.response || !weatherData.response.body || !weatherData.response.body.items) {
        weatherResults.innerHTML = `<p class="error">날씨 정보가 없습니다.</p>`;
        return;
    }

    const items = weatherData.response.body.items.item;
    const filteredData = items.filter(item => ['T1H', 'RN1', 'SKY', 'REH', 'PTY'].includes(item.category));

    // 시간대별로 데이터를 재조합
    const groupedData = groupWeatherData(filteredData);

    // 시간별로 오름차순 정렬
    const sortedTimes = Object.keys(groupedData).sort((a, b) => parseInt(a) - parseInt(b));

    // 데이터를 출력
    weatherResults.innerHTML = "";
    sortedTimes.forEach(time => {
        const weatherItem = groupedData[time];
        const weatherDiv = document.createElement("div");
        weatherDiv.classList.add("weather-item");

        // 하늘 상태와 강수 형태를 결합하여 현재 날씨 표시
        const currentWeather = getCurrentWeather(weatherItem);

        // 강수량 표시, 강수없음일 경우 0mm로 설정
        const rainfall = weatherItem.RN1 === "강수없음" || weatherItem.RN1 === "0" ? "0mm" : `${weatherItem.RN1}mm`;

        // 시각을 '11시'와 같이 간단하게 표현
        const formattedTime = formatTime(time);

        weatherDiv.innerHTML = `
            <h3>${formattedTime}</h3>
            <p>기온: ${weatherItem.T1H || 'N/A'}°C</p>
            <p>습도: ${weatherItem.REH || 'N/A'}%</p>
            <p>강수량: ${rainfall}</p>
            <p>현재 날씨: ${currentWeather}</p>
        `;

        weatherResults.appendChild(weatherDiv);
    });
}

// 시간대별 데이터 재조합 함수
function groupWeatherData(items) {
    const grouped = {};

    items.forEach(item => {
        const time = item.fcstTime;
        if (!grouped[time]) {
            grouped[time] = {};
        }
        grouped[time][item.category] = item.fcstValue;
    });

    return grouped;
}

// 현재 날씨 이모지 처리
function getCurrentWeather(weatherItem) {
    let sky = weatherItem.SKY;
    let pty = weatherItem.PTY;

    let weatherIcon = "☀️"; // 기본 하늘 상태: 맑음 (구름 없는 해)

    // 하늘 상태 및 강수 형태를 결합
    if (sky === "1" && pty === "1") {
        weatherIcon = "🌧️"; // 비
    } else if (sky === "1" && pty === "2") {
        weatherIcon = "❄️🌧️"; // 눈/비
    } else if (sky === "1" && pty === "3") {
        weatherIcon = "❄️"; // 눈
    } else if (sky === "3") {
        weatherIcon = "☁️"; // 구름 많음
    } else if (sky === "4") {
        weatherIcon = "🌫️"; // 흐림
    }

    return weatherIcon;
}


// 시각을 4자리 숫자에서 2자리로 변환하는 함수
function formatTime(time) {
    const hour = parseInt(time.slice(0, 2), 10);  // 4자리 문자열에서 시(hour)만 추출하여 숫자로 변환
    return `${hour}시`; // 9시, 10시 형태로 반환
}
