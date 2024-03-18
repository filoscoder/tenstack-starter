/**
 * Estos **no** son los datos utilizados por el bot, esta es solo una visualizacion.
 *
 * Para modificar los menus y respuestas del bot: modificar este archivo, convertir los
 * dos objetos a JSON strings y subirlas a su respecitivo lugar en la tabla
 * "BOT_MESSAGES" en la base de datos.
 *
 * Mantener siempre la estructura de los menús:
 * - las opciones deben empezar con la regex /\*\d+/ (asterisco seguido de un
 * numero)
 * - El primer mensaje debe ser el de bienvenida.
 * - El primer menú debe ser el principal, los siguientes son submenús.
 * - La última opción de un submenú siempre es "volver atrás".
 */
export const botMessages = [
  /** Bienvenida */
  [
    [
      "Hola 😃",
      "",
      "Bienvenido/a a *CASINO-MEX.COM* 🎰",
      "La plataforma de apuestas en línea más grande y segura de México 🇲🇽",
      "",
      "*OPEN LAS 24HS*",
    ],
    [
      "Apuesta, diviértete y *gana* con:",
      "",
      "🎰 *Slots / Tragamonedas*",
      "⚽ *Apuestas Deportivas*",
      "⭕ *Ruleta*",
      "♠ *Poker*",
      "♦ *Blackjack*",
      "➕ ¡Y muchos otros juegos mas!",
    ],
  ],
  /** Registro */
  [
    [
      "🌟 *CREAR USUARIO*",

      "_¡Crear tu cuenta es *GRATIS* y se realiza de inmediato *las 24hs, los 365 días del año!* Unicamente necesitas desplegar el menu lateral y cargar tus datos para que comiences a disfrutar en nuestra plataforma, solo te tomara un minuto ⏱️_",
      "",
      "📝 *DATOS PERSONALES:*",
      "",
      "_Datos Obligatorios_",
      "🤠 *Nombre completo* _Obligatorio_",
      "🔐 *Contraseña* _Obligatorio_",
      "📧 *Correo electrónico* _Obligatorio_",
      "",
      "_Datos Opcionales_",
      "👤 *Nombre/s* _Opcional_",
      "👤 *Apellido/s* _Opcional_",
      "📞 *Telefono* _Opcional_",
      "🐣 *Fecha de Nacimiento* _Opcional_",
      "",
      "_*¡Bienvenido/a a la diversión instantánea!*_ 🚀🎰,",
    ],
    [
      "🔒 *PROTECCION DE MIS DATOS:*",
      "",
      "La seguridad de tus datos es nuestra máxima prioridad💪",
      "",
      "Utilizamos tecnologías avanzadas de encriptación para proteger toda la información personal y financiera de nuestros jugadores. Además, cumplimos con todas las regulaciones y estándares de seguridad para garantizar la confidencialidad y protección de tus datos en todo momento.",
      "",
      "Puedes estar tranquilo sabiendo que tu privacidad está en buenas manos con nosotros🛡️.",
    ],
    [
      "🔐 *OLVIDÉ MI CONTRASEÑA:*",
      "",
      "¡No te preocupes en absoluto! Si has olvidado tu contraseña, simplemente ve al menu superior de *ACCEDER/ENTRAR* y haz click sobre el texto de *_¿Ha Olvidado Su Contraseña?_* y te enviaremos una nueva por mail.",
      "",
      "*Estamos aquí para asegurarnos de que tu única preocupación sea ¡divertirte al máximo!* 🎉",
    ],
  ],
  /** Carga de creditos */
  [
    [
      "🎰 *COMO CARGAR CREDITOS:*",
      "",
      "Cargar créditos es sencillo! ",
      "",
      "Solo desliza el menú lateral, verifica tu usuario y contraseña, ingresa cuantos pesos quieres cargar, elige la cuenta desde la que deseas transferir 💳💰 y realiza la transferencia. (Si no tienes una cuenta asociada, puedes ingresar los datos en el momento)",
      "",
      "¡Así de fácil y rápido! 🚀✨",
    ],
    [
      "💰 *MEDIOS DE PAGO:*",
      "",
      "Nuestro medio de pago es por transferencia bancaria 💳🏦.",
      "",
      "Te garantizamos total seguridad en todas tus transacciones y la rapidez que necesitas para disfrutar al máximo de nuestros servicios.",
      "",
      "¡Haz tus transacciones con total confianza y comodidad!",
    ],
    [
      "🎰 *CARGA MINIMA Y MAXIMA:*",
      "",
      "La carga *mínima de créditos es de $10 (MXN)*, brindándote un inicio emocionante.",
      "",
      "¡Y la carga *máxima es sin límite!* Tú decides cuánto quieres disfrutar en nuestra plataforma.🍀",
      "",
      "¡Elige la cantidad que se ajuste a tu diversión! 🚀💰",
    ],
    [
      "⏱️ *DEMORA DE CARGA DE CREDITOS:*",
      "",
      "La carga es prácticamente instantánea!",
      "",
      "Una vez acreditado el pago, los créditos se añaden a tu cuenta automáticamente en el momento. ",
      "",
      "stamos en línea realizando cargas las *24hs del día, los 365 días del año*, para que puedas sumergirte en la diversión sin demoras.*",
      "",
      "Listo para jugar en segundos!* 🚀💳✨",
    ],
    [
      "🎰 *CARGA DE CREDITOS:*",
      "",
      "Puedes cargar créditos tantas veces como desees, ¡incluso *varias veces en el mismo día*! Nos adaptamos a tu ritmo para que disfrutes de la diversión sin límites.",
      "",
      "*¡La emoción está en tus manos!* 💳🔄✨",
    ],
  ],
  /** Retiros */
  [
    [
      "💰 *RETIRO DE DINERO:*",
      " ",
      "Retirar dinero es más fácil que nunca. Simplemente despliega el menú lateral, elige *Retirar Dinero*, selecciona la cantidad deseada y la cuenta destino.",
      "     ",
      "¿No tienes cuenta destino? ¡No te preocupes! Puedes agregarla en el momento. 💳💸",
      "     ",
      "¡Listo para disfrutar de tus ganancias en un abrir y cerrar de ojos! 🎉✨",
    ],
    [
      "🍀*RETIRO MINIMO Y MAXIMO:*",
      " ",
      "El *retiro mínimo de premios es de $40* (MXN), asegurándote que tus ganancias sean significativas.",
      " ",
      "En cuanto al *retiro máximo, ¡NO HAY LIMITES!* Puedes retirar todas tus ganancias sin preocupaciones.",
      " ",
      "*¡Tu éxito merece ser celebrado sin restricciones!* 🎉💸🌟",
    ],
    [
      "🎰 *DEMORA DE RETIRO DE PREMIOS:*",
      " ",
      "Los retiros se procesan en *menos de 24hs*. Queremos que disfrutes de tus premios rápidamente, por lo que trabajamos de manera eficiente para que tengas acceso a tus ganancias en el menor tiempo posible.",
      " ",
      "*¡Tu diversión y comodidad son nuestra prioridad!* 🕒💸🌟",
    ],
    [
      "💰 *CANTIDAD DE RETIROS*",
      "     ",
      "Puedes retirar tus premios *una vez cada 24 horas.* Este límite asegura un manejo eficiente y seguro de tus retiros, proporcionándote la flexibilidad para disfrutar de tus ganancias de manera regular.",
      "      ",
      "*¡Tu comodidad y seguridad son nuestra prioridad!* 🕒💸🔄",
    ],
  ],
  /** Quienes somos */
  [
    [
      "🎰 *QUIENES SOMOS:*",
      "    ",
      "Somos *CASINO-MEX.COM*, la plataforma de apuestas en línea más grande y segura de *México* 🇲🇽. Además, estamos presentes en otras increíbles ubicaciones como *Brasil* 🇧🇷, *Argentina* 🇦🇷, *Perú* 🇵🇪 y *Paraguay* 🇵🇾.",
      "  ",
      "Queremos que sepas que tanto nuestra plataforma de pago como nuestra base de datos y juegos están certificados internacionalmente en *seguridad* 🔒 y *aleatoriedad* 🔀, con auditorías constantes para garantizar tu *tranquilidad y diversión*.",
      "   ",
      "*¡Estamos aquí para ofrecerte la mejor experiencia de juego!* 🥳❤️",
    ],
    [
      "🌟 🎰 *NUESTROS JUEGOS:*",
      "",
      "En *CASINO-MEX.COM* _La Casa de la Diversión y Emoción_ 🎉 Puedes encontrar mas de *1400 juegos*, estas son algunos de las categorias que tenemos en nuestra plataforma:",
      "",
      "- Apuestas Deportivas Programadas",
      "- Apuestas de Diversión EN VIVO",
      "- Apuestas en E-Sports",
      "- Slots / Tragamonedas",
      "- Ruleta",
      "- Ruleta en Vivo",
      "- Blackjack",
      "- Poker",
      "- Torneos",
      "- Sorteos",
      "¡Y mucho más!",
      "",
      "Es por esto somos la plataforma de apuestas más grande del país. Aquí, seguro encuentras el juego que va contigo.",
      "",
      "*¡Que empiece la diversión, compa!* 🚀🎰",
    ],
    [
      "📍 *NUESTRA UBICACION:*",
      "",
      "¡Orgullosos de tener nuestros servidores y oficinas de soporte en la vibrante Ciudad de México! 🇲🇽 Esta elección no es casualidad, ya que la capital mexicana no solo es el epicentro cultural y financiero del país, sino también un punto de encuentro para amantes del entretenimiento y la emoción.",
      "",
      "Descubre la emoción del juego en la palma de tu mano con nuestra plataforma en línea, estés donde estés. 📱🎰",
      "",
      "📍https://maps.app.goo.gl/2qEj7Ve6Fw3vPDeE9",
      "",
      "¡Te esperamos para vivir la experiencia única de nuestro casino en línea! 🌟",
    ],
  ],
  /** Otras Preguntas */
  [
    [
      "😱 *ERROR EN FUNCIONAMIENTO DE JUEGOS:*",
      "",
      "Si durante el juego ocurre algún error, como que se tilde, se cierre o se pierda la conexión a Internet, ¡no te preocupes!",
      "   ",
      "Tu saldo y premios se actualizan automáticamente en nuestra base de datos *en el momento en que ocurren*.",
      "    ",
      "Así podrás seguir disfrutando de la emoción del juego sin interrupciones. 😊🎰",
    ],
    [
      "🔄 *OTRA CONSULTA:*",
      "",
      "Si tu consulta no se encuentra dentro de las opciones anteriores, no dudes en comunicarte al 1111111111.",
      "",
      "Sin embargo, ten en cuenta que nuestros agentes pueden estar ocupados con muchos mensajes. Para obtener una respuesta más rápida, envíanos un mensaje a ese número con tu usuario o correo electrónico en la parte superior y, debajo, detalla tu consulta.",
      "",
      "¡Nos pondremos en contacto contigo lo antes posible! 🚀✉️ ¡Gracias por tu comprensión! 😊",
    ],
  ],
];

export const botMenus = [
  /** Menu principal */
  [
    "¿Con cual de estos temas podemos ayudarte?",
    "",
    "*1 - Registro y Cuenta*",
    "*2 - Carga de Creditos*",
    "*3 - Retiro de Dinero*",
    "*4 - Acerca de Nosotros*",
    "*5 - Otras consultas*",
    "",
    "_(Elige un numero)_",
  ],
  /** Submenus */
  [
    "👤 *REGISTRO Y CUENTA*",
    "",
    "*1 - ¿Cómo me registro?*",
    "*2 - ¿Mis datos están protegidos?*",
    "*3 - ¿Que pasa si olvido mi contraseña?*",
    "*4 - ¿Volver atras?*",
    "",
    "_(Elige un numero)_",
  ],
  [
    "🎰 *CARGA DE CREDITOS:*",
    "",
    "*1 - ¿Como cargo creditos?*",
    "*2 - ¿Que medio de pago ofrecen?*",
    "*3 - ¿Cual es la carga mínima y máxima de créditos?*",
    "*4 - ¿Cuanto demora la carga de créditos?*",
    "*5 - ¿Cuantas veces puedo cargar créditos?*",
    "*6 - Volver atras*",
    "",
    "_(Elige un numero)_",
  ],
  [
    "💰 *RETIRO DE DINERO:*",
    "",
    "*1 - ¿Como retiro mi dinero?*",
    "*2 - ¿Cual es el retiro minimo y máximo?*",
    "*3 - ¿Cuanto demora el retiro?*",
    "*4 - ¿Cuantos retiros puedo realizar?*",
    "*5 - Volver atras*",
    "",
    "_(Elige un numero)_",
  ],
  [
    "🎰 *ACERCA DE NOSOTROS:*",
    "",
    "*1 - ¿Quienes somos?*",
    "*2 - ¿Que juegos tenemos?*",
    "*3 - ¿Donde nos encontramos?*",
    "*4 - Volver atras*",
    "",
    "_(Elige un numero)_",
  ],
  [
    "🔄 *OTRAS CONSULTAS:*",
    "",
    "*1 - ¿Que sucede si hay un error en un juego?*",
    "*2 - No encuentro una opción para mi consulta*",
    "*3  - Volver atras*",
    "",
    "_(Elige un numero)_",
  ],
];
