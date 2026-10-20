/* ===== メンバー情報 ===== */
const EMPTY = {birthday:"", blood:"", hobby:"", skill:"", comment:"", x:"", instagram:"", hide:[]}; /* 未入力は「準備中」と表示 */
/* MEMBERS：photo=画像URL、birthday=誕生日、blood=血液型、hobby=趣味、skill=特技、comment=ひとこと、
   hide=表示しない項目（"blood" "hobby" "skill" から選ぶ。入れた項目はプロフィールに出ない）、
   x / instagram=アカウントID（@は付けても付けなくてもOK。URLを入れてもOK）。空欄なら「準備中」 */
const MEMBERS = [
  {name:"嶋田 はるみ", read:"しまだ はるみ", colorName:"水色",     color:"#7cc8ee", photo:"images/harumi.webp",
     birthday:"1月21日",hobby:"自炊、飲酒",comment:"はるみといっしょにもっさりタイム！",x:"harumi_cledol",instagram:"shimada__harumi",
     hide:["blood","skill"]},
  {name:"遠藤 えみり", read:"えんどう えみり", colorName:"白",       color:"#ffffff", photo:"images/emiri.webp",
     birthday:"1月30日",hobby:"食べる🍚お料理する🍳",comment:"えちゃんのこといっちゃんすきになる？",x:"echan_cledol",instagram:"echan_cledol",
     blood:"A型", hide:["skill"]},
  {name:"煌 かれん",   read:"きらめけ かれん", colorName:"紫",       color:"#b48be0", photo:"images/karen.webp",
     birthday:"7月13日",x:"karen_cledol",instagram:"oyasumikarenya",
     blood:"A型", hide:["hobby","skill"]},
  {name:"あも",        read:"あも",          colorName:"赤",       color:"#ee5d6c", photo:"images/amo.webp",
     birthday:"11月29日",x:"amo_cledol",instagram:"amo_cledol",
     hide:["blood","hobby","skill"]},
  {name:"心守 ちる",   read:"みまも ちる",    colorName:"オレンジ", color:"#ffa94d", photo:"images/chiru.webp",
     birthday:"5月5日",skill:"ピアノ",comment:"ちっちゃなみんなのヒーローめざして日々成長中！ここからはじまるちるの人生みまもってくださいっ！",x:"chiru_cledol",instagram:"chiru_cledol",
     hide:["blood","hobby"]},
].map(m => ({...EMPTY, ...m}));
