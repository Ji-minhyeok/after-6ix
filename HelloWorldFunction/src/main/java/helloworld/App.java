package helloworld;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

public class App implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent request, Context context) {
        // 쿼리 파라미터에서 base_date, base_time, nx, ny 정보를 추출
        String baseDate = request.getQueryStringParameters().get("base_date");
        String baseTime = request.getQueryStringParameters().get("base_time");
        String nx = request.getQueryStringParameters().get("nx");
        String ny = request.getQueryStringParameters().get("ny");

        // 파라미터 유효성 검사
        if (baseDate == null || baseTime == null || nx == null || ny == null) {
            return createResponse(400, "Missing required parameters.");
        }

        // 날씨 API 호출
        String weatherData = getWeatherData(baseDate, baseTime, nx, ny);

        if (weatherData == null) {
            return createResponse(500, "Failed to fetch weather data.");
        }

        // 날씨 정보 반환
        return createResponse(200, weatherData);
    }

    // 날씨 API 호출 메소드
    private String getWeatherData(String baseDate, String baseTime, String nx, String ny) {
        try {
            String serviceKey = System.getenv("SERVICE_KEY");

            if (serviceKey == null || serviceKey.isEmpty()) {
                System.err.println("SERVICE_KEY is not set in environment variables.");
                return null;
            }

            // API URL과 파라미터 설정
            StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst");
            urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + URLEncoder.encode(serviceKey, "UTF-8")); // 환경 변수에서 가져온 서비스 키
            urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode("1", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode("2000", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("dataType", "UTF-8") + "=" + URLEncoder.encode("JSON", "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("base_date", "UTF-8") + "=" + URLEncoder.encode(baseDate, "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("base_time", "UTF-8") + "=" + URLEncoder.encode(baseTime, "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("nx", "UTF-8") + "=" + URLEncoder.encode(nx, "UTF-8"));
            urlBuilder.append("&" + URLEncoder.encode("ny", "UTF-8") + "=" + URLEncoder.encode(ny, "UTF-8"));

            // 생성된 URL 로그 출력
            String urlString = urlBuilder.toString();
            System.out.println("Generated URL: " + urlString);

            // API 호출
            URL url = new URL(urlBuilder.toString());
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");

            BufferedReader rd;
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
                rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }

            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line);
            }
            rd.close();
            conn.disconnect();

            return sb.toString();  // API 응답 반환
        } catch (IOException e) {
            return null;  // 오류 발생 시 null 반환
        }
    }

    // Lambda 응답 생성 메소드
    private APIGatewayProxyResponseEvent createResponse(int statusCode, String body) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(statusCode);
        response.setBody(body);

        // CORS 설정
        response.setHeaders(Map.of(
                "Access-Control-Allow-Origin", "*", // 모든 출처에서의 접근 허용
                "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS", // 허용되는 HTTP 메서드
                "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With" // 허용되는 헤더
        ));

        return response;
    }
}
