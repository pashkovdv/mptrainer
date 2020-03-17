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
  });

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

    this.task = question(this.histOfTrain, this.hardness);

    
  }

  onSelect(ans) {
    if ( this.task.correctFound || this.timeLeft <= 0) return;
    
    let op = (this.task.operation == '*') ? 'm': 'd';

    let i = this.task.i1 - 1;
    let j = this.task.i2 - 1;

    if ( ans == this.task.correctAnswer ){
      this.task.correctFound = true;
      if (this.task.answered.length == 0) {
        this.histOfTrain[op][i][j]++;
        this.hardness[op]++;

        if (this.timeLeft > timeToAnswer/3) {
          this.histOfTrain[op][i][j]++;
        }
      }
    } else {
      this.task.answered.push( ans );
      this.hardness[op] = Math.round (0.7 * this.hardness[op])
      this.histOfTrain[op][i][j] = Math.round (0.7 * this.histOfTrain[op][i][j]);
    }
    setStorage('results_3', this.histOfTrain)
    setStorage('hardness', this.hardness)
  }

  nextQ() {
    this.timeLeft = timeToAnswer;
    this.task = question(this.histOfTrain, this.hardness);
  }

}
