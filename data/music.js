/* ===== 楽曲（MUSIC） ===== */
/* MUSIC：サブスク楽曲。links=聴く（icon=services/アイコンのキー）、downloads=購入・ダウンロード。cover=ジャケット画像、links=配信サービス（label=ボタンの文字、url=リンク）、tracks=収録曲（t=曲名、d=時間）。date=リリース日（空なら非表示） */
const MUSIC = [
  {title:"Claireism", type:"ALBUM", artist:"Claire♡Dolls", date:"2026.07.31", cover:"images/jacket.webp",
   links:[
     {label:"Apple Music", icon:"apple", url:"https://www.tunecore.co.jp/to/apple_music/1883273?lang=en"},
     {label:"YouTube Music", icon:"ytm", url:"https://www.tunecore.co.jp/to/youtube_music_key/1883273?lang=en"},
     {label:"Spotify", icon:"spotify", url:"https://www.tunecore.co.jp/to/spotify/1883273?lang=en"},
     {label:"Amazon Music", icon:"amazon", url:"https://www.tunecore.co.jp/to/amazon_music/1883273?lang=en"},
     {label:"LINE MUSIC", icon:"line", url:"https://www.tunecore.co.jp/to/line/1883273?lang=en"}],
   all:"https://linkco.re/vYtaada6",
   tracks:[{t:"夢みる星の姫", d:"4:26"}, {t:"over the limit", d:"4:10"}, {t:"Clear Drive", d:"4:25"}, {t:"雪花舞い散り君想ふ", d:"4:16"}, {t:"from the new stage", d:"4:04"}]},
  {title:"Dolls Have Souls", type:"ALBUM", artist:"Claire♡Dolls", date:"2026.02.02", cover:"images/jacket2.webp",
   links:[
     {label:"Apple Music", icon:"apple", url:"https://www.tunecore.co.jp/to/apple_music/1637756?lang=en"},
     {label:"YouTube Music", icon:"ytm", url:"https://www.tunecore.co.jp/to/youtube_music_key/1637756?lang=en"},
     {label:"Spotify", icon:"spotify", url:"https://www.tunecore.co.jp/to/spotify/1637756?lang=en"},
     {label:"Amazon Music", icon:"amazon", url:"https://www.tunecore.co.jp/to/amazon_music/1637756?lang=en"},
     {label:"LINE MUSIC", icon:"line", url:"https://www.tunecore.co.jp/to/line/1637756?lang=en"}],
   all:"https://linkco.re/11BfyBn0?locale=ja",
   tracks:[{t:"絶対BELIEVER", d:"4:09"}, {t:"ハジけろジンセイ", d:"4:32"}, {t:"雨音のステップビート", d:"4:36"}, {t:"ヒミツのきもち。", d:"3:57"}, {t:"Fairy Tale", d:"4:15"}]},
];

/* 配信サービスのアイコン画像（icon:のキーと対応） */
const ICONS = {
  apple:"images/i-apple.webp",
  spotify:"images/i-spotify.webp",
  ytm:"images/i-ytm.webp",
  line:"images/i-line.webp",
  amazon:"images/i-amazon.webp",
  awa:"images/i-awa.webp",
  kkbox:"images/i-kkbox.webp",
  dhits:"images/i-dhits.webp",
  deezer:"images/i-deezer.webp",
  itunes:"images/i-itunes.webp",
  recochoku:"images/i-recochoku.webp",
  mora:"images/i-mora.webp"
};
