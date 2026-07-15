export type ChoiceConsequence = {
  message: number;
  responsibility: number;
  harmony: number;
  insight: string;
  future: string;
};

export type Choice = {
  id: string;
  label: string;
  description: string;
  consequence: ChoiceConsequence;
};

export type EchoMood = 'neutral' | 'happy' | 'sad' | 'thinking';

export type Scenario = {
  id: string;
  title: string;
  context: string;
  echoName: string;
  echoEmoji: string;
  echoMood: EchoMood;
  prompt: string;
  choices: Choice[];
};

export const scenarios: Scenario[] = [
  {
    id: 'wellspring',
    title: 'نبع القرية',
    context: 'وصلت إلى قرية جفّ ماؤها. أهلها يبحثون عن ماء، والصغار عطاشى.',
    echoName: 'صدى الماء',
    echoEmoji: '💧',
    echoMood: 'sad',
    prompt: 'ماذا تفعل أولاً؟',
    choices: [
      {
        id: 'dig',
        label: 'احفر بئراً جديداً',
        description: 'تبحث عن الماء بنفسك قبل أن تطلب من أحد المساعدة.',
        consequence: {
          message: 2, responsibility: 3, harmony: 1,
          insight: 'حفرت بئراً وحدك. الماء خرج، لكنك أنهكت نفسك ولم تُعلّم أحداً كيف يفعلها.',
          future: 'بعد عشر سنين: البئر ما زالت تعمل، لكن أهل القرية لم يتعلّموا الحفر.',
        },
      },
      {
        id: 'teach',
        label: 'علّم أهل القرية كيف يحفرون',
        description: 'تجمع الناس وتُريهم الخطوات، ثم تحفر معهم.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'علّمت الناس فصاروا قادرين على إطالة عمر أنفسهم. الرسالة انتقلت لا البئر فقط.',
          future: 'بعد عشر سنين: القرية كلها أصبحت تحفر آبارها، وانتشر الماء في كل مكان.',
        },
      },
      {
        id: 'trade',
        label: 'اذهب واشترِ ماءً من بلد بعيد',
        description: 'تستورد الماء من مكان آخر بدل البحث عنه هنا.',
        consequence: {
          message: 1, responsibility: 1, harmony: 0,
          insight: 'حلّت العطشة مؤقتاً، لكن القرية صارت تعتمد عليك في كل مرة تجف فيها الآبار.',
          future: 'بعد عشر سنين: القرية لم تتعلّم الاكتفاء، وكلما جفّ الماء انتظرت قدومك.',
        },
      },
    ],
  },
  {
    id: 'quarrel',
    title: 'خصام الجارين',
    context: 'جاران يتخاصمان على حدود أرضيهما. كل واحد يرى نفسه على حق، والخصام يشتعل.',
    echoName: 'صدى الصلح',
    echoEmoji: '🕊️',
    echoMood: 'thinking',
    prompt: 'كيف تحلّ الخصام؟',
    choices: [
      {
        id: 'judge',
        label: 'احكم بينهما بالعدل',
        description: 'تستمع للطرفين ثم تُقسّم الأرض بينهما بحسب ما تراه عادلاً.',
        consequence: {
          message: 2, responsibility: 3, harmony: 2,
          insight: 'حكمت بالعدل فهدأ الخصام. لكنهما لم يتعلّما كيف يحلّان نزاعهما في المستقبل.',
          future: 'بعد عشر سنين: الجاران في سلام، لكن أي خصام جديد ينتظر حكماً من خارج القرية.',
        },
      },
      {
        id: 'mediate',
        label: 'أجلسهما معاً وأُسمع كل واحد الآخر',
        description: 'تُيسّر حواراً بينهما حتى يفهم كل واحد موقف الآخر.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'أسمعت كل واحد الآخر، فاكتشفا أن الخلاف كان على سوء فهم. صارا يُحلّان مشاكلهما وحدهما.',
          future: 'بعد عشر سنين: الجاران صارا يُحلّان أي نزاع بالحوار، وعلّما غيرهما ذلك.',
        },
      },
      {
        id: 'ignore',
        label: 'دعهما يحلّان الأمر بأنفسهما',
        description: 'تتجاوز الموقف وتتركهما لشأنهما.',
        consequence: {
          message: 0, responsibility: 0, harmony: -1,
          insight: 'تركت الخصام يشتعل. أحياناً الصمت حكمة، وأحياناً تفريط.',
          future: 'بعد عشر سنين: الخصام تحوّل إلى عداوة طويلة، وقسّم القرية إلى فريقين.',
        },
      },
    ],
  },
  {
    id: 'garden',
    title: 'حديقة الصغار',
    context: 'في الساحة أطفال يلعبون في أرض جرداء. لا ظل ولا زرع ولا مكان للجمال.',
    echoName: 'صدى الغرس',
    echoEmoji: '🌱',
    echoMood: 'neutral',
    prompt: 'ماذا تصنع في هذه الأرض؟',
    choices: [
      {
        id: 'plant-self',
        label: 'ازرع الأشجار بنفسي',
        description: 'تأتي بالبذور وتغرسها جميعاً في يوم واحد.',
        consequence: {
          message: 2, responsibility: 3, harmony: 1,
          insight: 'غرست بسرعة، لكن الأطفال لم يشاركوا، فلم يشعروا أن الحديقة حديقتهم.',
          future: 'بعد عشر سنين: الأشجار كبرت، لكن لا أحد في القرية يعتني بها لأنها ليست "ملكهم".',
        },
      },
      {
        id: 'involve-kids',
        label: 'وزّع البذور على الأطفال وازرع معهم',
        description: 'تجعل كل طفل يغرس شجرته ويتابع نموها.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'كل طفل غرس شجرته وصار يحرص عليها. الحديقة صارت مكاناً يحبه الجميع.',
          future: 'بعد عشر سنين: الحديقة صارت متنزه القرية، والأطفال الكبار يعلّمون الصغار الغرس.',
        },
      },
      {
        id: 'pave',
        label: 'بسّط الأرض بالأسمنت',
        description: 'تغطّي الأرض بالأسمنت لتكون ساحة لعب نظيفة.',
        consequence: {
          message: 1, responsibility: 1, harmony: 0,
          insight: 'ساحة لعب نظيفة، لكن لا ظل ولا زرع ولا حياة تنمو فيها.',
          future: 'بعد عشر سنين: الساحة أسمنتية حارة في الصيف، والأطفال يتمنّون الظل.',
        },
      },
    ],
  },
  {
    id: 'traveler',
    title: 'المسافر الغريب',
    context: 'رجل غريب يمرّ بالقرية، جائع وتعب. الناس لا يعرفونه ويخشون منه.',
    echoName: 'صدى الكرم',
    echoEmoji: '🌙',
    echoMood: 'neutral',
    prompt: 'كيف تستقبل الغريب؟',
    choices: [
      {
        id: 'feed-send',
        label: 'أُطعمه ثم أُودّعه',
        description: 'تُعطيه طعاماً وشراباً ثم تُشيّعه في طريقه.',
        consequence: {
          message: 2, responsibility: 2, harmony: 1,
          insight: 'أطعمته وشبع، لكنه مضى ولم يبقَ بينكم رابط.',
          future: 'بعد عشر سنين: مرّ المسافر ولم يعد، ولم تعرفوا عنه شيئاً.',
        },
      },
      {
        id: 'host-listen',
        label: 'أُضيفه وأستمع لقصته',
        description: 'تُكرم نزوله وتجلس معه لتسمع من أين جاء وإلى أين يذهب.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'استقبلته كرماً واستمعت إليه اهتماماً. صار صديقاً للقرية وحمل أخباركم إلى بلده.',
          future: 'بعد عشر سنين: صار الرجل جسراً بين قريتكم وبلده، وانتشرت أخباركم الحسنة.',
        },
      },
      {
        id: 'avoid',
        label: 'أُحذّر الناس منه',
        description: 'تخشون منه فتُبعدونه عن القرية.',
        consequence: {
          message: 0, responsibility: 1, harmony: -1,
          insight: 'أبعدته خوفاً. ربما كان آمناً، لكن الخوف منعكم من معرفة ذلك.',
          future: 'بعد عشر سنين: صارت القرية معروفة بكرهها للغرباء، فقلّ من يمرّ بها.',
        },
      },
    ],
  },
  {
    id: 'old-woman',
    title: 'أمّ القرية',
    context: 'عجوز وحيدة في بيتها على أطراف القرية. لا أحد يزورها، وهي تحكي حكايات قديمة لا يسمعها أحد.',
    echoName: 'صدى البرّ',
    echoEmoji: '🕯️',
    echoMood: 'sad',
    prompt: 'ماذا تصنع لأمّ القرية؟',
    choices: [
      {
        id: 'visit-alone',
        label: 'زرها بنفسي واجلس معها',
        description: 'تذهب إليها وحدك، تجلس وتستمع إلى حكاياتها.',
        consequence: {
          message: 2, responsibility: 2, harmony: 2,
          insight: 'جلست معها وأنست وحدتها. لكنك وحدك من عرف حكاياتها.',
          future: 'بعد عشر سنين: توفّيت العجوز وحكاياتها معها، لأنك لم تُبلّغها أحداً.',
        },
      },
      {
        id: 'bring-children',
        label: 'أحضر الأطفال لتسمع حكاياتها',
        description: 'تأخذ أطفال القرية إلى بيتها ليستمعوا ويُدوّنوا حكاياتها.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'أدخلت الفرح على قلبها، وحكاياتها صارت في صدور الأطفال لا تُنسى.',
          future: 'بعد عشر سنين: حكايات أمّ القرية صارت تراثاً يُروى ويُعلَّم للأجيال.',
        },
      },
      {
        id: 'build-house',
        label: 'ابنِ لها بيتاً أفضل',
        description: 'تُصلح بيتها المتهالك وتهتمّ بسقفه وجدرانه.',
        consequence: {
          message: 1, responsibility: 3, harmony: 1,
          insight: 'أصلحت بيتها، لكن وحدتها ما زالت. الجدران لا تُسكن القلب.',
          future: 'بعد عشر سنين: بيتها جميل لكنها ما زالت وحيدة، والحكايات ما زالت بلا سامع.',
        },
      },
    ],
  },
  {
    id: 'storm',
    title: 'العاصفة القادمة',
    context: 'تظهر في الأفق غيوم داكنة. العاصفة قادمة بعد أيام، والقرية ليست مستعدة.',
    echoName: 'صدى الاستعداد',
    echoEmoji: '⛈️',
    echoMood: 'thinking',
    prompt: 'كيف تُعدّ القرية للعاصفة؟',
    choices: [
      {
        id: 'fix-alone',
        label: 'أصلح البيوت بنفسي',
        description: 'تطوف على البيوت وتُصلح السقوف المتصدّعة وحدك.',
        consequence: {
          message: 2, responsibility: 3, harmony: 1,
          insight: 'أصلحت ما استطعت، لكنك واحد وحدك والوقت قصير.',
          future: 'بعد عشر سنين: في كل عاصفة، القرية تنتظر أن تصلح أنت السقوف وحدك.',
        },
      },
      {
        id: 'organize',
        label: 'نظّم فرقاً ووزّع المهام',
        description: 'تجمع الناس، تكوّن فرقاً: فريق للسقوف، فريق للمؤن، فريق للصغار.',
        consequence: {
          message: 3, responsibility: 2, harmony: 3,
          insight: 'وزّعت المسؤولية فصار كل واحد يعرف دوره. القرية صارت مستعدة لأي عاصفة.',
          future: 'بعد عشر سنين: القرية صارت تُنظّم نفسها في كل أزمة دون انتظار أحد.',
        },
      },
      {
        id: 'pray',
        label: 'ادعُ الله وانتظر',
        description: 'تدعو أن تصرف العاصفة وتنتظر.',
        consequence: {
          message: 1, responsibility: 0, harmony: 0,
          insight: 'دعوت ولم تُقدّم. الأخذ بالأسباب لا ينفي التوكل، بل هو من التوكل.',
          future: 'بعد عشر سنين: العواصف تأتي والقرية لا تستعد، وتنتظر المعجزات.',
        },
      },
    ],
  },
];

export const seasons = [
  { name: 'الربيع', icon: '🌸', color: 'from-emerald-400 to-teal-500' },
  { name: 'الصيف', icon: '☀️', color: 'from-amber-400 to-orange-500' },
  { name: 'الخريف', icon: '🍂', color: 'from-orange-400 to-red-500' },
  { name: 'الشتاء', icon: '❄️', color: 'from-sky-300 to-blue-500' },
] as const;
