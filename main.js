'use strict'

const GOAL = 260

const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃花色
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 紅心花色
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊花色
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花花色
]

const model = {
  // data
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0
}

const view = {
  // UI
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },

  getCardElement(index) {
    return `
      <div class="card back" data-index="${index}" data-number="${index % 13}">
      </div>
    `
  },

  displayCards(randomNumbers) {
    const rootElement = document.querySelector('#cards')
    const array1 = randomNumbers
    const array2 = array1.map(index => this.getCardElement(index))
    const str = array2.join('')
    rootElement.innerHTML = str
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  // filipCards (1, 2, 3, 4, 5)
  // cards = [1, 2, 3, 4, 5]
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) { // 目前是背面
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))

      } else { // 目前是正面
        // 回傳背面
        card.classList.add('back')
        card.innerHTML = null // 把<p>和<img>清空
      }
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You have tried: ${times} times`
  },

  appendFailMatchAnimations(...cards) {

    cards.map(card => {
      card.classList.add('fail')
      card.addEventListener('animationend',
        event => {
          card.classList.remove('fail')
        },
        {
          once: true // 一次性，動畫過後，remove addEventListener
        }
      )
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You have tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const controller = {
  // flow
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return // 目前點的卡片不是背面，直接 return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)

        view.renderTriedTimes(++model.triedTimes)

        // console.log(model.isRevealedCardsMatched())
        if (model.isRevealedCardsMatched()) { // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards) // 改背面顏色
          model.revealedCards = [] // 清空
          view.renderScore(model.score += 10)

          if (model.score === GOAL) {
            console.log('show game finished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits

        } else { // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendFailMatchAnimations(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break


    }
    this.showState()
  },

  resetCards() {
    // console.log('resetCards')
    view.flipCards(...model.revealedCards) // 翻面
    model.revealedCards = [] // 清空
    controller.currentState = GAME_STATE.FirstCardAwaits
    controller.showState()
  },

  showState() {
    console.log('this.currentState =', this.currentState)
    console.log('revealedCards =', model.revealedCards.map(card => card.dataset.index))
  }
}

const utility = { // 小工具，外掛函式庫
  getRandomNumberArray(count) {
    const numbers = Array.from(Array(count).keys())
    for (let index = numbers.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [numbers[index], numbers[randomIndex]] = [numbers[randomIndex], numbers[index]];
    }
    return numbers
  }
}

controller.generateCards()

// 為52張牌，每張牌都加上監聽器
// document.querySelectorAll('.card').forEach( card => {
//   card.addEventListener('click', event => {
//     controller.dispatchCardAction(card)
//   })
// })
document.querySelectorAll('.card').forEach(add52Listeners)
function add52Listeners(element) {
  element.addEventListener('click', clickTriggerAction)
}
function clickTriggerAction(event) {
  const target = event.target
  // console.log('target =', target)
  controller.dispatchCardAction(target)

}