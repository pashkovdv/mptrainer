import { Component } from '@angular/core';
import { timer } from 'rxjs';
import packageJson from "../../package.json";

import question from './questions.js'

const timeToAnswer = 20;

function setStorage (n: string, o: object) {
  localStorage.setItem(n, JSON.stringify(o) )
}

function getStorage (n: string) {
  return JSON.parse( localStorage.getItem(n) );
}

function makeStatText( stat: any ){
  let txt;
  txt = stat.left + " " + stat.correct + "/" + stat.all + " ";
  txt += (stat.all > 0) ? Math.round (100*stat.correct/stat.all) : "0";
  txt += "%";
  return txt;
}

function makeStatOb( stat: any ){
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yyyy = today.getFullYear();
  const strDay = `${dd}-${mm}-${yyyy}`;
  const percent = stat.all > 0 ? Math.round (100*stat.correct/stat.all) : "0";
  const ob = {
    strDay,
    left: stat.left,
    correct: stat.correct,
    all: stat.all,
    percent
  };
  return ob;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  version = packageJson.version
  title = 'mp-trainer';
  numberOfQuestions = 0;
  histOfTrain: any = {
    m: [],
    d: [],
  }
  task: any = {}
  hardness: any = {
    m: 0,
    d: 0,
  };
  histOf100: any[];

  timeLeft = timeToAnswer;
  source = timer(0, 1000);;
  subscribe = this.source.subscribe(val => {
    if (this.stat.end) return;
    this.timeLeft--

    if (this.timeLeft == 0) {
      this.task.timeEnd = true;
      setStorage('saved_question', this.task)
      if (!this.task.correctFound && !this.stat.end){
        this.stat.left++
        this.stat.text = makeStatText(this.stat);
        setStorage('saved_stat', this.stat)
      }
    }
  });

  stat: any = {
    correct: 0,
    all: 0,
    left: this.numberOfQuestions,
    end: true,
    text: '0 0/0 0%'
  };
  
  ngOnInit() {
    // инициализируем таблицу сложностей для операндов умножения
    if ( getStorage('results_3') === null ) {
      let arr = [];
      for (let i=0; i<12; i++){
        arr.push([]);
        for (let j=0; j<12; j++) arr[i].push(0)
      }
      setStorage('results_3', {m:arr, d:arr})
    };
    this.histOfTrain = getStorage('results_3')

    // иницаилизируем общую сложность
    if (getStorage('hardness') === null ) setStorage('hardness', this.hardness );
    this.hardness = getStorage('hardness');

    // инициализируем текущие вопрос
    let tempQuestion = question(this.histOfTrain, this.hardness);
    let saved_question = getStorage('saved_question')
    if (saved_question === null ){
      setStorage('saved_question', tempQuestion)
    } else if ( !saved_question.timeEnd && !saved_question.correctFound) {
      tempQuestion = saved_question;
    };
    this.task = tempQuestion;

    // поднимем записанную статистику сессии
    let saved_stat = getStorage('saved_stat')
    if (saved_stat === null ){
      setStorage('saved_stat', this.stat)
    } else {
      if ( !saved_stat.end ) {
        saved_stat.left = saved_stat.left + 1;
        saved_stat.text = makeStatText(saved_stat);
        setStorage('saved_stat', saved_stat)
      }
      this.stat = saved_stat;
    };

    // поднимем историю тренировок
    this.histOf100 = getStorage('histOf100') || [];
    this.histOf100 = this.histOf100.map( item => { // раньше данные хранились в строке вида "0 3/3 100%", пересоберем такие данные в объект
      if ( typeof item === 'string') {
        let arr = item.split(' ');
        return {
          strDay: "",
          left: arr[0],
          correct: arr[1].split('/')[0],
          all: arr[1].split('/')[1],
          percent: arr[2].split('%')[0],
        };
      };
      return item;
    });
  }

  statReset(numberOfQuestions) {
    this.numberOfQuestions = numberOfQuestions;
    this.stat.correct = 0,
    this.stat.all = 0,
    this.stat.left = this.numberOfQuestions;
    this.stat.end = false,
    this.stat.text = this.numberOfQuestions + ' 0/0 0%'

    this.timeLeft = timeToAnswer;
  }

  onSelect(ans) {
    if ( this.task.correctFound || this.timeLeft <= 0) return;
    
    let op = (this.task.operation == '*') ? 'm': 'd';

    let i = this.task.i1 - 1;
    let j = this.task.i2 - 1;

    if ( ans == this.task.correctAnswer ){

      this.task.correctFound = true;
      if (this.task.answered.length == 0) {

        if (!this.stat.end){
          this.stat.correct++;
          this.stat.all++;
          this.stat.left--;
        }

        this.histOfTrain[op][i][j]++;
        this.hardness[op]++;

        if (this.timeLeft > timeToAnswer/3) {
          this.histOfTrain[op][i][j]++;
        }
      }
    } else {
      if (!this.stat.end){
        this.stat.all++;
        this.stat.left++
      };
      this.task.answered.push( ans );
      this.hardness[op] = Math.round (0.8 * this.hardness[op])
      this.histOfTrain[op][i][j] = Math.round (0.8 * this.histOfTrain[op][i][j]);
    }

    this.stat.text = makeStatText(this.stat);
    if (this.stat.left <= 0){ 
      this.stat.end = true;
      setStorage('saved_stat', this.stat);
      this.histOf100.unshift(  makeStatOb(this.stat) );
      setStorage('histOf100',  this.histOf100 );
    }

    setStorage('results_3', this.histOfTrain)
    setStorage('hardness', this.hardness)
    if (!this.stat.end) setStorage('saved_stat', this.stat)
    
  }

  nextQ() {
    this.timeLeft = timeToAnswer;
    this.task = question(this.histOfTrain, this.hardness);

    setStorage('saved_question', this.task)
  }

  paramlog() {
    let at = [];
    at.push("--------------task---------------")
    for (let v in this.task) at.push(v + " = " + this.task[v])
    at.push("--------------stat---------------")
    for (let v in this.stat) at.push(v + " = " + this.stat[v])
    at.push("--------------timeLeft---------------")
    at.push("timeLeft = " + this.timeLeft)
    return at;
  }

}
