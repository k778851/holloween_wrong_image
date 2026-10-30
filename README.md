# 🎃 할로윈 틀린그림 찾기

제한 시간 30초 안에 두 그림의 다른 곳 5개를 찾는 웹 게임입니다.
시간 안에 못 찾으면... 무언가 나타납니다. 👻

## 실행

- **온라인**: GitHub Pages 주소로 접속
- **오프라인**: 폴더를 내려받아 `index.html` 을 더블클릭

## 문항 / 이미지 바꾸기

설정은 모두 [`config.js`](config.js) 에 있습니다.

1. `images/` 에 원본(`_a`)과 틀린 그림(`_b`)을 같은 크기로 넣습니다.
2. `config.js` 의 `levels` 에 경로를 적습니다.
3. `index.html?edit` 로 열어 틀린 곳을 클릭 → 나온 `differences` 를 복사해서 붙여넣습니다.
   - 물체가 이동한 경우: 클릭 후 반대쪽 그림을 **Shift+클릭**

| 설정 | 설명 |
|---|---|
| `timeLimit` | 제한 시간(초) |
| `shuffle` | 문항 순서 무작위 |
| `wrongClickPenalty` | 오답 클릭 시 깎이는 시간(초) |
| `ghostImage` | 시간 초과 시 나오는 귀신 이미지 |
| `sound` | 볼륨, 배경음, 효과음 파일 교체 |

## 파일 구성

```
index.html   화면
config.js    설정 (문항, 시간, 사운드)
game.js      게임 로직
sound.js     효과음 / 배경음
style.css    디자인
images/      문항 이미지, 귀신 이미지
```
