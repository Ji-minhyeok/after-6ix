<img src="https://after6ix-s3.s3.ap-northeast-2.amazonaws.com/after6ix_logo.jpg" alt="로고" width="500">

현 위치를 기반으로 6시간 내의 상대적으로 정확도가 높은 초단기 기상예측을 제공하는 서비스입니다.

(Java 기반 AWS Lambda 어플리케이션)

## 배포 링크
[![배포 링크](https://img.shields.io/badge/Deploy-Link-blue?style=for-the-badge)](https://d2uy0kreyqusu8.cloudfront.net/)

---

## 🛠 **프로젝트 개요**

- ✅**AWS Lambda**를 이용한 서버리스 환경 구축
  - **AWS Toolkit**을 활용한 Lambda 배포 및 코드 업데이트 자동화
  - **API Gateway**를 통해 외부 요청을 Lambda로 연결

- ✅**Java**를 기반으로 날씨 API 호출 및 데이터 반환
  - **기상청의 초단기예보 API** 연동

- 🚧**정적 웹 페이지** 배포
  - **S3** 배포 파일 업로드 (HTML, CSS, JavaScript 파일 업로드) (완료)
  - **Geolocation API** 연동 -> 사용자의 위치 정보 가져오기 (진행중)
  - **CloudFront** 배포 (완료)

---

## 🚀 **다음 계획**
- **Route 53** 활용한 커스텀 도메인 적용
- **Geolocation API** 좌표로 현재 위치를 지도에 표시

---

