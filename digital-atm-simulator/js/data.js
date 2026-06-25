/**
 * js/data.js
 * Digital ATM – Full step data for Core Standard & VIP Speedrun
 * 
 * 15 Core steps + 12 VIP steps = 27 total screens
 * All text, buttons, product details, and progress labels are extracted
 * directly from the provided screenshots.
 */

const STEP_DATA = {
  // ============================================================
  // CORE STANDARD (15 steps)
  // Screens: GetImage.png through GetImage (14).png
  // ============================================================
  core: [
    {
      id: 'core-1',
      title: 'Congratulations On Getting In',
      subtitle: '',
      paragraphs: [
        'You made a great decision. Let\'s build your first one together, right now.',
        'Watch this short video first. While you watch, think of something you own that you already use and love. Something on your kitchen countertop. That\'s where we\'ll get started.'
      ],
      primaryButton: 'I watched it, let\'s build',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Call (877) 210-7172. We\'ve got your back.',
      product: null,
      progress: null,
      showVideo: true,
      videoDuration: '1:40'
    },
    {
      id: 'core-2',
      title: 'Your First Piece Of Property',
      subtitle: 'Right now, you\'re making a great decision. You already thought of something you own and love.',
      paragraphs: [
        'Amazon is one of those giant corporations. You put that product up, someone buys it, and Amazon pays you.',
        'In a few minutes, you\'ll own your first piece of digital real estate, with that product on it. Let\'s put it up together.'
      ],
      primaryButton: 'Claim My Digital Real Estate',
      secondaryButton: 'Talk to someone right now to get me started',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Call (877) 210-7172. We\'ve got your back.',
      product: null,
      progress: { now: 'Product', next: 'Name' }
    },
    {
      id: 'core-3',
      title: 'Put Up The Thing You Love',
      subtitle: 'Now we put up that thing on your countertop, the one you already own and love, the one you\'d tell a friend to buy.',
      paragraphs: [
        'You do not need an Amazon account, and you don\'t need to buy anything else. You already have everything you need.',
        'Paste anything you copied. A full link, a short link, even a whole chunk of text, we\'ll find the link inside it.'
      ],
      primaryButton: 'That\'s the link',
      secondaryButton: 'Show me others',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck on this step? Email us at support@digitalatmapp.com',
      product: null,
      progress: null,
      exampleProducts: [
        'Baja Gold Signature Mineral Sea Salt - Recommended by Gary Brecka',
        'Electric Golf Push Cart, Foldable Smart Robotic Caddy with 6-Axis Gyroscope',
        'Mellann Extra Deep Queen Sheets - 4 PC Ionic Collection Bedding'
      ]
    },
    {
      id: 'core-4',
      title: 'Building your site',
      subtitle: 'Getting Your Product Ready',
      paragraphs: [
        'Nice work. We\'re pulling the details from Amazon for you right now. Sit tight.',
        'Your product photo is on its way.',
        'Finding your product on Amazon',
        'Pulling in the picture',
        'Checking the price',
        'Getting it ready for your page',
        'Almost there',
        'Setting up your very first product. Hang tight.'
      ],
      primaryButton: null,
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: null,
      progress: null,
      isLoading: true
    },
    {
      id: 'core-5',
      title: 'Make Sure This Is The One',
      subtitle: 'We pulled it in for you from the product\'s Amazon link. Take a look. Does this look right?',
      paragraphs: [],
      primaryButton: 'Yes, that\'s it',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck? Call (877) 210-7172 and a real person can help with this step.',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker, big audio and punchy bass, IP67 waterproof and dustproof, 5 hours of playtime, speaker...',
        shortName: 'JBL Go 3',
        image: 'jbl-go3.jpg'
      },
      progress: null
    },
    {
      id: 'core-6',
      title: 'Say Why You Love It',
      subtitle: 'This is the move: you recommend it, someone buys it, and Amazon, the corporation, pays you.',
      paragraphs: [
        'Write your note and that loop is live.',
        'Say it the way you\'d say it out loud, the way you\'d tell a friend. A sentence or two is plenty, no length to hit.',
        'Write your own, or tap "Do it for me" and we\'ll draft it from a couple quick questions, then you finish it in your own words.'
      ],
      primaryButton: 'That\'s my note, continue',
      secondaryButton: 'Do it for me',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck? Call (877) 210-7172 and a real person can help with this step.',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      progress: null
    },
    {
      id: 'core-7',
      title: 'AI helper',
      subtitle: 'Tell us about this product',
      paragraphs: [
        'All three are optional. Any detail you share gives the AI a better starting point, but you can leave them blank and we\'ll draft a page from the product title alone.'
      ],
      primaryButton: 'Write the page',
      secondaryButton: 'Just chat instead',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: null,
      progress: null,
      aiPrompts: [
        { label: 'Why do you recommend it?', placeholder: 'It does X really well. Saves me time on Y.' },
        { label: 'Who\'s it for?', placeholder: 'People who want X without spending much time on Y.' },
        { label: 'Anything you didn\'t love?', placeholder: 'Heavier than I expected. Wish the manual were clearer.' }
      ]
    },
    {
      id: 'core-8',
      title: 'You Did The Hard Part',
      subtitle: 'Here\'s your preview. This is what people will see. Now what? One tap puts it on your site.',
      paragraphs: [
        'I keep this little JBL speaker around for quick music, podcasts, and video sound when I do not want to fuss with anything bigger. It is a good fit for someone who wants a small speaker that is easy to carry from room to room or toss in a bag for a trip.',
        'What I like most is how full it sounds for its size. It does not feel tiny once the music starts playing. The bass has more punch than I expected, and it is loud enough for a bedroom, kitchen, or a small get-together outside.',
        'The waterproof and dustproof build is a nice bonus. It makes me less careful in the wrong way, which is helpful for something this portable.',
        'The one thing I would change is battery life. It is fine for a few hours of use, but if you are planning a long day away from a charger, you will want to keep that in mind.',
        'I like this most as a grab-and-go speaker for everyday use. It is not trying to be a big home audio setup. It is just a compact speaker that sounds better than it should and fits easily into normal life.',
        'One small downside is that the controls are tiny, so if you are in a hurry you may have to glance down to hit the right button.'
      ],
      primaryButton: 'Add it to my site',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck? Call (877) 210-7172 and a real person can help with this step.',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      progress: null
    },
    {
      id: 'core-9',
      title: 'Name Your Digital ATM',
      subtitle: 'This is the fun part, and it\'s yours. Don\'t overthink it, you can change it anytime.',
      paragraphs: [
        'This is what people see at the top of your site. Your address (the web link) comes next.'
      ],
      primaryButton: null,
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck? Call (877) 210-7172 and a real person can help with this step.',
      product: null,
      progress: { now: 'Name', next: 'Address' },
      nameSuggestions: ['My Honest Picks', 'My Favorite Finds', 'Things I Actually Use'],
      inputPlaceholder: 'Your site\'s name'
    },
    {
      id: 'core-10',
      title: 'One Product Is The Win',
      subtitle: 'You did it. You\'ve got everything you need to go live. Let\'s do it.',
      paragraphs: [
        'Want more products on your site? You can add more later. One is all you need right now.'
      ],
      primaryButton: 'Let\'s get this one live',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Stuck? Call (877) 210-7172 and a real person can help with this step.',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      progress: { now: 'Address', next: 'Live' }
    },
    {
      id: 'core-11',
      title: 'Claim Your Address',
      subtitle: 'This is the real address on the internet that points to your site. A name was the start. An address makes it yours.',
      paragraphs: [
        'We\'ve already started one for you. Keep it, or change it to whatever you like.'
      ],
      primaryButton: 'This is my address',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      progress: { now: 'Address', next: 'Live' },
      suggestedAddress: 'things-i-actually-use-2',
      domain: 'preprod.buyerfieldguide.com'
    },
    {
      id: 'core-12',
      title: 'Go Live',
      subtitle: 'Everything\'s ready, and it\'s all yours. One product is all it takes. Tap the button to make your site real.',
      paragraphs: [],
      primaryButton: 'Publish my site',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      progress: null
    },
    {
      id: 'core-13',
      title: 'Look At What You Built',
      subtitle: 'Stop and take this in. This is yours, and it\'s live.',
      paragraphs: [
        'This is your digital real estate. You own it, it\'s live, and you built it today. Great work.'
      ],
      primaryButton: 'Visit my site',
      secondaryButton: 'Keep going',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'JBL Go 3 - Portable Mini Bluetooth Speaker...',
        shortName: 'JBL Go 3'
      },
      liveUrl: 'things-i-actually-use-2.preprod.buyerfieldguide.com',
      author: 'test callcenter core 02',
      progress: null
    },
    {
      id: 'core-14',
      title: 'Bookmark This Page',
      subtitle: 'One more thing, and you\'re set. Bookmark this Digital ATM page so you can always get back to the playbook.',
      paragraphs: [
        'How to bookmark this Digital ATM page',
        'iPhone (Safari): 1. Tap the share button at the bottom of the screen. 2. Tap Add Bookmark. 3. Tap Save.',
        'Android (Chrome): 1. Tap the share button. 2. Tap Add Bookmark. 3. Tap Save.'
      ],
      primaryButton: 'Done, bookmarked',
      secondaryButton: 'Skip for now',
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: null,
      progress: null
    },
    {
      id: 'core-15',
      title: 'Your Real Estate Is Live',
      subtitle: 'You did the hard part today. You own a site now, with your first product on it.',
      paragraphs: [
        'The playbook teaches you how to make it earn.',
        'As you go through the playbook, you\'ll grow this into the site you\'ll apply to Amazon with. One product is your start. The next lessons build from here.',
        'You\'ll have full control to edit your site anytime from your dashboard.'
      ],
      primaryButton: 'Keep going in the playbook',
      secondaryButton: null,
      supportPhone: '(877) 210-7172',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'Samsung 27" Essential S3 (S36GD) Series FHD 1800R Curved Computer Monitor...',
        shortName: 'Samsung S3 Monitor'
      },
      progress: null,
      author: 'Rylie A'
    }
  ],

  // ============================================================
  // VIP SPEEDRUN (12 steps)
  // Screens: GetImage.png through GetImage (11).png (VIP set)
  // ============================================================
  vip: [
    {
      id: 'vip-1',
      title: '🎯 Congratulations On Getting In',
      subtitle: 'Done-With-You · Priority',
      paragraphs: [
        'You made a great decision. Let\'s build your first one together, right now.',
        'Watch this short video first. While you watch, think of something you own that you already use and love. Something on your kitchen countertop. That\'s where we\'ll get started.',
        'You went all in, and it shows. You\'re on the Done-With-You track now, so we\'re doing the heavy lifting with you. You just fill in the blanks, and a real person from our team is standing by to walk you through it.'
      ],
      primaryButton: 'I watched it, let\'s build',
      secondaryButton: 'Talk to someone right now to get me started',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Call (888) 210-9529. We\'ve got your back.',
      product: null,
      progress: null,
      showVideo: true,
      videoDuration: '1:40',
      isVip: true
    },
    {
      id: 'vip-2',
      title: 'Claim Your Done-With-You Setup Call',
      subtitle: 'Here\'s the good news: we\'ve done about 95% of the heavy lifting for you.',
      paragraphs: [
        'The part that\'s left is the one piece only you can do, telling people about the products you love and why. On your setup call, a real person walks you through it and builds it right alongside you.',
        'On your setup call, we\'ll:',
        '• Get your first piece of property set up with you, start to finish.',
        '• Walk you through each step on the screen, at your pace.',
        '• Put you at the front of the line, because you upgraded.'
      ],
      primaryButton: 'Start My Done-With-You Setup',
      secondaryButton: 'Talk to someone right now to get me started',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Call (888) 210-9529. We\'ve got your back.',
      product: null,
      progress: { now: 'Product', next: 'Name' },
      isVip: true
    },
    {
      id: 'vip-3',
      title: 'Put Up The Thing You Love',
      subtitle: 'Now we put up that thing on your countertop, the one you already own and love, the one you\'d tell a friend to buy.',
      paragraphs: [
        'You do not need an Amazon account, and you don\'t need to buy anything else. You already have everything you need.',
        'Paste anything you copied. A full link, a short link, even a whole chunk of text, we\'ll find the link inside it.'
      ],
      primaryButton: 'That\'s the link',
      secondaryButton: 'Show me others',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Call (888) 210-9529. We\'ve got your back.',
      product: null,
      progress: null,
      isVip: true,
      exampleProducts: [
        'WaterWipes Sensitive+ Newborn & Baby Wipes, 3-In-1 Cleans, Cares, Protects, 99.9% Water',
        'BYZOOM FITNESS Pure Series Adjustable Kettlebell 30/40/50LB - 5-IN-1 Weight Change',
        'Apple iPhone 14, 128GB, Midnight for GSM Carriers (Renewed)'
      ]
    },
    {
      id: 'vip-4',
      title: 'Make Sure This Is The One',
      subtitle: 'We pulled it in for you from the product\'s Amazon link. Take a look. Does this look right?',
      paragraphs: [],
      primaryButton: 'Yes, that\'s it',
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Stuck? Call (888) 210-9529 and tell us you are on the Done-With-You Speedrun.',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle with Two-Way Spout, Built-In Straw and Bucket Handle, Made for Trav...',
        shortName: 'Owala FreeSip Sway',
        image: 'owala.jpg'
      },
      progress: null,
      isVip: true
    },
    {
      id: 'vip-5',
      title: 'Say Why You Love It',
      subtitle: 'This is the move: you recommend it, someone buys it, and Amazon, the corporation, pays you.',
      paragraphs: [
        'Write your note and that loop is live.',
        'Say it the way you\'d say it out loud, the way you\'d tell a friend. A sentence or two is plenty, no length to hit.',
        'Write your own, or tap "Do it for me" and we\'ll draft it from a couple quick questions, then you finish it in your own words.'
      ],
      primaryButton: 'That\'s my note, continue',
      secondaryButton: 'Do it for me',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Stuck? Call (888) 210-9529 and tell us you are on the Done-With-You Speedrun.',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      progress: null,
      isVip: true
    },
    {
      id: 'vip-6',
      title: 'AI helper',
      subtitle: 'Tell us about this product',
      paragraphs: [
        'All three are optional. Any detail you share gives the AI a better starting point, but you can leave them blank and we\'ll draft a page from the product title alone.'
      ],
      primaryButton: 'Write the page',
      secondaryButton: 'Just chat instead',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: null,
      progress: null,
      isVip: true,
      aiPrompts: [
        { label: 'Why do you recommend it?', placeholder: 'It does X really well. Saves me time on Y.' },
        { label: 'Who\'s it for?', placeholder: 'People who want X without spending much time on Y.' },
        { label: 'Anything you didn\'t love?', placeholder: 'Heavier than I expected. Wish the manual were clearer.' }
      ]
    },
    {
      id: 'vip-7',
      title: 'You Did The Hard Part',
      subtitle: 'Here\'s your preview. This is what people will see. Now what? One tap puts it on your site.',
      paragraphs: [
        'I keep a bottle like this around for the days when I am out the door early and do not want to think about drinks again until much later. This is the kind of bottle that makes sense for somebody who carries water all day, tosses a bag into the car, and wants one container that can handle school, work, the gym, or a long errand run without becoming a nuisance.',
        'What I like most is the way it gives you two ways to drink without making the lid feel fussy. Sometimes I want a straw because I am at my desk or driving and just want a quick sip. Sometimes I want to tip the bottle back and take a bigger drink.',
        'The insulated stainless steel body is doing the kind of work I want from a bottle like this. Cold drinks stay cold long enough that I do not have to babysit them, and the outside does not sweat all over the table or the inside of a bag.',
        'The bucket handle is another thing I ended up appreciating more than I expected. It makes the bottle easier to grab when my hands are full, and it is a lot more comfortable than a tiny cap loop that digs into your fingers.',
        'Who this is for is pretty clear to me. It is for somebody who wants one bottle to do a lot of jobs. It works for a student carrying it between classes, a parent tossing it into a bag with other gear, or anyone who wants enough capacity to get through a long stretch without hunting for a sink.',
        'There is one small thing I would change. A bottle this size is naturally bulky, and when it is full it has some weight to it. That is not a flaw, exactly, just the tradeoff for having a forty-ounce insulated bottle that feels substantial.'
      ],
      primaryButton: 'Add it to my site',
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      progress: null,
      isVip: true
    },
    {
      id: 'vip-8',
      title: 'Name Your Digital ATM',
      subtitle: 'This is the fun part, and it\'s yours. Don\'t overthink it, you can change it anytime.',
      paragraphs: [
        'This is what people see at the top of your site. Your address (the web link) comes next.'
      ],
      primaryButton: null,
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Stuck? Call (888) 210-9529 and tell us you are on the Done-With-You Speedrun.',
      product: null,
      progress: { now: 'Name', next: 'Address' },
      nameSuggestions: ['My Honest Picks', 'My Favorite Finds', 'Things I Actually Use'],
      inputPlaceholder: 'Your site\'s name',
      isVip: true
    },
    {
      id: 'vip-9',
      title: 'One Product Is The Win',
      subtitle: 'You did it. You\'ve got everything you need to go live. Let\'s do it.',
      paragraphs: [
        'Want more products on your site? You can add more later. One is all you need right now.'
      ],
      primaryButton: 'Let\'s get this one live',
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Stuck? Call (888) 210-9529 and tell us you are on the Done-With-You Speedrun.',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      progress: { now: 'Address', next: 'Live' },
      isVip: true
    },
    {
      id: 'vip-10',
      title: 'Claim Your Address',
      subtitle: 'This is the real address on the internet that points to your site. A name was the start. An address makes it yours.',
      paragraphs: [
        'We\'ve already started one for you. Keep it, or change it to whatever you like.'
      ],
      primaryButton: 'This is my address',
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      progress: { now: 'Address', next: 'Live' },
      suggestedAddress: 'my-favorite-finds-6',
      domain: 'preprod.buyerfieldguide.com',
      isVip: true
    },
    {
      id: 'vip-11',
      title: 'Go Live',
      subtitle: 'Everything\'s ready, and it\'s all yours. One product is all it takes. Tap the button to make your site real.',
      paragraphs: [],
      primaryButton: 'Publish my site',
      secondaryButton: null,
      supportPhone: '(888) 210-9529',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      progress: null,
      isVip: true
    },
    {
      id: 'vip-12',
      title: 'Look At What You Built',
      subtitle: 'Stop and take this in. This is yours, and it\'s live.',
      paragraphs: [
        'This is your digital real estate. You own it, it\'s live, and you built it today. Great work.'
      ],
      primaryButton: 'Visit my site',
      secondaryButton: 'Keep going',
      supportPhone: '(888) 210-9529',
      supportLabel: 'Need help? Email us at support@digitalatmapp.com',
      product: {
        name: 'Owala FreeSip Sway Insulated Stainless Steel Water Bottle...',
        shortName: 'Owala FreeSip Sway'
      },
      liveUrl: 'my-favorite-finds-6.preprod.buyerfieldguide.com',
      author: 'test callcenter speedrun 07',
      progress: null,
      isVip: true
    }
  ]
};

// Export for global access (compatible with script tag)
if (typeof window !== 'undefined') {
  window.STEP_DATA = STEP_DATA;
}

// Also support ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STEP_DATA;
}
