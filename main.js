'use strict'

// 變數區域
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

const versionSwitch = document.querySelector('.version-btn-container')

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
  switchBackground(event) { // 按左上角切換風格的按鈕，會進來
    const target = event.target;
    if (target.matches('#version-btn-1')) {
      target.classList.add('active')
      target.nextElementSibling.classList.remove('active')
      target.nextElementSibling.nextElementSibling.classList.remove('active')
      background = Array.from(background1)
      document.querySelectorAll('.card').forEach(element => {
        if (element.matches('.back')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(52))
        } else if (element.matches('.paired')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(element.dataset.index))
        }
        element.style.backgroundSize = 'contain';
      })
    } else if (target.matches('#version-btn-2')) {
      target.classList.add('active')
      target.previousElementSibling.classList.remove('active')
      target.nextElementSibling.classList.remove('active')
      background = Array.from(background2)
      document.querySelectorAll('.card').forEach(element => {
        if (element.matches('.back')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(52))
        } else if (element.matches('.paired')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(element.dataset.index))
        }
        element.style.backgroundSize = 'contain';
      })
    } else if (target.matches('#version-btn-3')) {
      target.classList.add('active')
      target.previousElementSibling.classList.remove('active')
      target.previousElementSibling.previousElementSibling.classList.remove('active')
      background = Array.from(background3)
      document.querySelectorAll('.card').forEach(element => {
        if (element.matches('.back')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(52))
        } else if (element.matches('.paired')) {
          element.style.backgroundImage = view.getBackgroundImage(Number(element.dataset.index))
        }
        element.style.backgroundSize = 'contain';
      })
    }
  },
  getBackgroundImage(index) {
    return background[index].bg
  },
  // filipCards (1, 2, 3, 4, 5)
  // cards = [1, 2, 3, 4, 5]
  flipCards(...cards) { // 點選任何一張還沒配對成功的卡牌，會進來
    cards.map(card => {
      if (card.classList.contains('back')) { // 目前是背面
        // 回傳正面
        card.classList.remove('back')
        const index = card.dataset.index
        card.innerHTML = this.getCardContent(Number(index))
        card.style.backgroundImage = this.getBackgroundImage(Number(index))
        card.style.backgroundSize = 'contain';

      } else { // 目前是正面
        // 回傳背面
        card.classList.add('back')
        card.innerHTML = null // 把<p>和<img>清空
        card.style.backgroundImage = this.getBackgroundImage(Number(52))
        card.style.backgroundSize = 'contain';
      }
    })
  },

  pairCards(...cards) { // 把配對成功的一對牌， class 加上 'paired'
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
            // console.log('show game finished')
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

// 主要流程開始
controller.generateCards()
// 監聽器區域 
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
  controller.dispatchCardAction(target)

}

versionSwitch.addEventListener('click', view.switchBackground)

background = Array.from(background1)


