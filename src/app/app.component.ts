import { Component } from '@angular/core';
import { timer } from 'rxjs';

import question from './questions.js'

function setStorage (n: string, o: object) {
  localStorage.setItem(n, JSON.stringify(o) )
}

function getStorage (n: string) {
  return JSON.parse( localStorage.getItem(n) );
}

const timeToAnswer = 10;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mp-trainer';

  histOfTrain: any = {
    m: [],
    d: [],
  }
  task: any = {}
  hardness: any = {
    m: 0,
    d: 0,
  };

  timeLeft = timeToAnswer;
  source = timer(0, 1000);;
  subscribe = this.source.subscribe(val => {
    this.timeLeft--

    if (this.timeLeft == 0) {
      this.task.timeEnd = true;
      setStorage('saved_question', this.task)
      if (!this.task.correctFound && !this.stat.end){
        this.stat.left++
        this.stat.text = this.stat.left + " " + this.stat.correct + "/" + this.stat.all + " " + Math.round (100*this.stat.correct/this.stat.all) + "%";
        setStorage('saved_stat', this.stat)
      }
    }
  });

  stat: any = {
    correct: 0,
    all: 0,
    left: 100,
    end: true,
    text: '0 0/0 0%'
  };
  

  ngOnInit() {
    
    if ( getStorage('results_3') === null ) {
      
      let arr = [];
      for (let i=0; i<12; i++){
        arr.push(new Array());
        for (let j=0; j<12; j++) arr[i].push(0)
      }

      let arr2 = arr.slice();

      if ( getStorage('results_2') !== null ) {
        arr = getStorage('results_2');
        localStorage.removeItem('results_2');
      }
      setStorage('results_3', {m:arr, d:arr2})
    }
    this.histOfTrain = getStorage('results_3')

    let h = getStorage('hardness')
    if (h === null ){
      setStorage('hardness', this.hardness )
    } else if (typeof h == 'number') {
      setStorage('hardness', {m:h, d:0})
    }
    this.hardness = getStorage('hardness');

    let tempQuestion = question(this.histOfTrain, this.hardness);
    let saved_question = getStorage('saved_question')
    if (saved_question === null ){
      setStorage('saved_question', tempQuestion)
    } else if ( !saved_question.timeEnd && !saved_question.correctFound) {
      tempQuestion = saved_question;
    }
    this.task = tempQuestion;

    let saved_stat = getStorage('saved_stat')
    if (saved_stat === null ){
      setStorage('saved_stat', this.stat)
    } else {
      this.stat = saved_stat;
    }

  }

  statReset() {
    this.stat.correct = 0,
    this.stat.all = 0,
    this.stat.left = 100;
    this.stat.end = false,
    this.stat.text = '100 0/0 0%'

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
      this.hardness[op] = Math.round (0.7 * this.hardness[op])
      this.histOfTrain[op][i][j] = Math.round (0.7 * this.histOfTrain[op][i][j]);
    }

    this.stat.text = this.stat.left + " " + this.stat.correct + "/" + this.stat.all + " " + Math.round (100*this.stat.correct/this.stat.all) + "%";
    if (this.stat.left <= 0){ 
      this.stat.end = true;
      setStorage('saved_stat', this.stat)
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

}
