import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigationheader',
  templateUrl: './navigationheader.component.html',
  styleUrls: ['./navigationheader.component.scss']
})
export class NavigationheaderComponent implements OnInit {

  @Input() title: string;
  @Input() showBackButton: boolean;
  @Input() backButtonClicked: () => void;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

  }

  navigateBack(): void {
    if (this.backButtonClicked) {
      this.backButtonClicked();
    }
  }

}
