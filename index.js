const { ThrowableRouter, json, error, StatusError } = require('itty-router-extras')

const router = ThrowableRouter()
const GOOGLE_API_PLACE_KEY = 'AIzaSyAR5lIC9Zrcaki3RCbfz-vqtgSbNx_CrYo'

if (typeof addEventListener == "function") {
  addEventListener('fetch', event => {
    event.respondWith(router.handle(event.request))
  })
}

const utils = {
  permutation(arr) {
    if (arr.length == 0) return [[]]
    return arr.flatMap((_, i) => this.permutation(arr.filter((_, i2) => i2 != i)).map(ans => {
      return [arr[i], ...ans]
    }))
  },
  cross_product(head, ...tail) {
    if (tail.length == 0 && head == undefined) return [[]]
    return this.cross_product(...tail).flatMap(arr => head.map(h => [h, ...arr]))
  }
}

const JenosizeController = {
  /** 
   * {@link https://developers.google.com/maps/documentation/places/web-service/search-find-place#maps_http_places_findplacefromtext_mca-js}
   */
  find_place(place) {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json
      ?input=${encodeURIComponent(place)}
      &inputtype=textquery
      &fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry
      &key=${GOOGLE_API_PLACE_KEY}`.replace(/\s/g, '');
    return fetch(url)
      .then(res => res.json())
  }
}

const Game24Controller = {
  /**
   * {@link https://stackoverflow.com/questions/2277015/writing-a-c-version-of-the-algebra-game-24?lq=1}
   */
  calculate(numbers) {
    const operator_function = {
      '+': (a, b) => a + b,
      '-': (a, b) => a - b,
      '*': (a, b) => a * b,
      '/': (a, b) => a / b,
    }
    const arimatics = Object.keys(operator_function);
    // postfix calculation order = reverrse polish notation (RPN)
    const postfix_calculate_orders = [
      'NNNNAAA',
      'NNNANAA',
      'NNNAANA',
      'NNANNAA',
      'NNANANA',
    ];

    for (let [orders, nums, opers] of utils.cross_product(
      postfix_calculate_orders,
      utils.permutation(numbers),
      utils.cross_product(
        arimatics,
        arimatics,
        arimatics,
      ),
    )) {
      nums = [...nums]
      opers = [...opers]
      const rpn = Array.from(orders).map(o => o == 'N' ? nums.pop() : opers.pop());
      let stk = []
      for (const o of rpn) {
        if (typeof o == "number") {
          stk.push(o)
        } else if (arimatics.includes(o)) {
          let a = stk.pop();
          let b = stk.pop();
          stk.push(operator_function[o](a, b));
        }
      }
      if (stk[0] == 24) {
        return {
          solve: 'YES',
          solution: rpn
        }
      }
    }
    return {
      solve: 'NO'
    }
  }
}

router.get('/jenosize/place', async (request) => {
  const data = await JenosizeController.find_place(request.query.q);
  return json(data)
})

router.get('/game24/:num1/:num2/:num3/:num4', async (request) => {
  const { num1, num2, num3, num4 } = request.params;
  const data = Game24Controller.calculate([+num1, +num2, +num3, +num4]);
  if (![num1, num2, num3, num4].join('').match(/^[1-9]{4}$/)) {
    data.warning = "number should be 1-9"
  }
  return json(data)
})

router.post('/auth/login', 
  async request => {
    const body = await request.json()
    if (!body.username || typeof body.username != "string") throw new StatusError(400, "require username")
    if (!body.password || typeof body.password != "string") throw new StatusError(400, "require password")
    request.body = body;
  },
  async () => {
    // TODO
    return error(501, "not implement")
  }
)

router.post('/tictactoe/:table', 
  async request => {
    const { table } = request.params;
    if (table.length != 9) return error(400, 'table length must be 9 (3x3)')
    for (const c of table) {
      if (!"xo_".includes(c)) {
        return error(400, `expect only [x,o,_] got ${c}`)
      }
    }
    // TODO
    return error(501, "not implement. using minimax algorithm is optimal solution")
  }
)

router.get('/', async () => {
  return json({ 
    message: "font end วุ่นวายเกิน บ้าจริง",
    git: "https://github.com/krist7599555/jenosize",
    api: [
      'GET /jenosize/place?q=ดรีมเวิล',
      'GET /game24/:num1/:num2/:num3/:num4',
      'GET /game24/8/1/1/5',
      'POST /auth/login',
    ]
  });
})
router.get('*', async () => {
  return error(404, 'not found')
})

// console.log(Game24Controller.calculate([8,5,6,1]))
// console.log(utils.cross_product([8,1,1,1],['a', 'b']))