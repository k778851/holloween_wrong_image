/*
 * 할로윈 틀린그림 찾기 - 설정 파일
 * ------------------------------------------------------------
 * 이미지를 바꾸고 싶으면 이 파일만 수정하면 됩니다.
 *
 * 1) images 폴더에 원본/틀린 이미지를 넣는다. (두 이미지는 같은 크기여야 합니다)
 * 2) 아래 levels 에 경로를 적는다.
 * 3) index.html?edit 으로 열고 틀린 곳을 클릭해서 좌표를 얻는다.
 *    → 나온 differences 를 그대로 복사해서 붙여넣기.
 *
 * 좌표(x, y)와 반경(r)은 모두 이미지 크기 대비 % (0~100) 단위라서
 * 이미지 해상도가 바뀌어도 그대로 동작합니다.
 */
window.GAME_CONFIG = {
  title: "할로윈 틀린그림 찾기",

  // 제한 시간(초). 레벨마다 timeLimit 을 따로 적으면 그 값이 우선합니다.
  timeLimit: 30,

  // 틀린 곳을 클릭했을 때 깎이는 시간(초). 0 이면 패널티 없음.
  wrongClickPenalty: 2,

  // 정답 판정 반경 기본값 (이미지 가로폭 대비 %). 레벨/항목별 r 로 덮어쓸 수 있음.
  hitRadius: 6,

  // true 면 게임을 시작할 때마다 단계(문항) 순서를 무작위로 섞습니다.
  shuffle: true,

  // 시간 초과 시 나오는 귀신 이미지
  ghostImage: "images/ghost.svg",

  // 사운드 설정
  sound: {
    enabled: true, // false 면 모든 소리 끔
    volume: 0.8,   // 전체 볼륨 (0 ~ 1)
    bgm: true,     // 으스스한 배경음 (바람 + 드론 + 오르골)

    // 내 파일로 바꾸고 싶은 소리만 경로를 적으세요. 비워두면 내장 효과음을 씁니다.
    files: {
      // bgm:      "sounds/bgm.mp3",      // 배경음 (반복 재생)
      // start:    "sounds/start.mp3",    // 단계 시작
      // correct:  "sounds/correct.mp3",  // 정답
      // wrong:    "sounds/wrong.mp3",    // 오답
      // tick:     "sounds/tick.mp3",     // 남은 10초 째깍
      // clear:    "sounds/clear.mp3",    // 단계 클리어
      // allClear: "sounds/win.mp3",      // 모든 단계 클리어
      // scream:   "sounds/scream.mp3",   // 귀신 등장
    },
  },

  // 귀신 화면 유지 시간(ms). 이후 결과 화면이 나옵니다.
  ghostDuration: 2500,

  // 틀린 곳 적는 법
  //   { x, y }                       : 양쪽 같은 위치
  //   { a: {x, y}, b: {x, y} }       : 물체가 이동한 경우 (a = 원본, b = 틀린 그림)
  //   r 을 붙이면 그 항목만 판정 반경 변경
  levels: [
    {
      name: "마녀의 묘지",
      original: "images/level1_a.png",
      modified: "images/level1_b.png",
      differences: [
        { x: 82, y: 82, r: 9 },                       // 호박 얼굴
        { x: 77, y: 51, r: 7 },                       // 까마귀
        { a: { x: 66, y: 72 }, b: { x: 45, y: 70 } }, // 랜턴 위치
        { x: 64, y: 15, r: 9 },                       // 달 (구름/박쥐)
        { x: 48, y: 46, r: 7 },                       // 묘비
      ],
    },
    {
      name: "저주받은 서재",
      original: "images/level2_a.png",
      modified: "images/level2_b.png",
      differences: [
        { x: 26, y: 21, r: 9 }, // 벽의 초상화(거울)
        { x: 76, y: 61, r: 8 }, // 해골 → 모래시계
        { x: 58, y: 67 },       // 의자 옆 소품
        { x: 36, y: 90 },       // 의자 앞 책
        { x: 8, y: 92 },        // 왼쪽 아래 책
      ],
    },
    {
      name: "마녀의 가마솥",
      original: "images/level3_a.png",
      modified: "images/level3_b.png",
      differences: [
        { x: 70, y: 22 }, // 달 앞 박쥐
        { x: 88, y: 24 }, // 벽 등불
        { x: 11, y: 83 }, // 왼쪽 아래 촛불
        { x: 88, y: 78 }, // 오른쪽 촛불 → 약병
        { x: 80, y: 80 }, // 고양이
      ],
    },
    {
      name: "유령의 저택",
      original: "images/level4_a.png",
      modified: "images/level4_b.png",
      differences: [
        { a: { x: 82, y: 58 }, b: { x: 72, y: 62 }, r: 8 }, // 유령 위치
        { x: 47, y: 13, r: 7 },                              // 달 앞 모습
        { x: 55, y: 28 },                                    // 창문 불빛
        { x: 87, y: 50 },                                    // 별 문양
        { x: 14, y: 89, r: 8 },                              // 묘비 문양
      ],
    },
    {
      name: "안개 낀 선착장",
      original: "images/level5_a.png",
      modified: "images/level5_b.png",
      hitRadius: 5,
      differences: [
        { a: { x: 70, y: 67 }, b: { x: 20, y: 56 }, r: 7 }, // 배 위치
        { a: { x: 21, y: 37 }, b: { x: 31, y: 44 } },       // 매달린 등불
        { a: { x: 28, y: 40 }, b: { x: 24, y: 32 } },       // 올가미 줄
        { a: { x: 59, y: 57 }, b: { x: 37, y: 60 } },       // 선착장 등불
        { x: 86, y: 63, r: 7 },                              // 표지판 문구
      ],
    },
  ],
};
