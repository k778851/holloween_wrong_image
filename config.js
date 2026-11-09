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

  // 터치(태블릿/휴대폰) 판정 보정: 반경 배율, 최소 반경(화면 px)
  touchRadiusScale: 1.3,
  touchMinRadiusPx: 28,

  // true 면 게임을 시작할 때마다 단계(문항) 순서를 무작위로 섞습니다.
  shuffle: true,

  // 한 판에 나오는 문항 수. 1 이면 levels 중 1개만 무작위로 출제. 0 이면 전부.
  questionsPerGame: 1,

  // 시간 초과 시 나오는 귀신 이미지 (화면을 꽉 채워 표시)
  ghostImage: "images/ghost.webp",

  // 이미지에서 얼굴(눈) 위치 (%). 확대·접근 효과의 중심이 됩니다.
  ghostFocus: { x: 50, y: 33 },

  // 깜빡임 효과 기본값. 시작 화면의 체크박스로 플레이어가 끌 수도 있습니다.
  ghostFlash: true,

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

  // 귀신 연출 타이밍(ms)
  ghostPause: 400,     // 시간 0 → 귀신 등장 전 정적
  ghostDuration: 2300, // 귀신이 보이는 시간 (이후 암전 → 결과 화면)

  // 틀린 곳 적는 법
  //   { x, y }                       : 양쪽 같은 위치
  //   { a: {x, y}, b: {x, y} }       : 물체가 이동한 경우 (a = 원본, b = 틀린 그림)
  //   r 을 붙이면 그 항목만 판정 반경 변경
  levels: [
    {
      name: "허수아비 들판",
      original: "images/q1_a.webp",
      modified: "images/q1_b.webp",
      differences: [
        { x: 27.6, y: 14.5, r: 5 },   // 달 앞 박쥐
        { x: 69.3, y: 21, r: 4 },     // 허수아비 호박 입
        { x: 69.3, y: 39.8, r: 4 },   // 옷의 단추
        { x: 22.9, y: 42.2, r: 4 },   // 집 창문 불빛
        { x: 39.8, y: 68, r: 5 },     // 파란 호박
      ],
    },
    {
      name: "유령의 저택",
      original: "images/q2_a.webp",
      modified: "images/q2_b.webp",
      differences: [
        { x: 39.6, y: 10.4, r: 5 },   // 달 앞 박쥐
        { x: 53.9, y: 15.6, r: 4 },   // 탑 창문
        { x: 8.3, y: 48.6, r: 4 },    // 기둥의 초승달
        { x: 92.1, y: 47.6, r: 5 },   // 파란 등불
        { x: 36.2, y: 72.8, r: 5 },   // 꺼진 호박
      ],
    },
    {
      name: "마녀의 탁자",
      original: "images/q3_a.webp",
      modified: "images/q3_b.webp",
      differences: [
        { x: 61.8, y: 8.2, r: 5 },    // 달 앞 박쥐
        { x: 39.9, y: 37.1, r: 5.5 }, // 고양이 눈 색
        { x: 52.1, y: 55.8, r: 4 },   // 왼쪽 촛불 불꽃
        { x: 74, y: 62.5, r: 5 },     // 파란 촛불
        { x: 90.1, y: 63, r: 4.5 },   // 호박 코
      ],
    },
  ],
};
