import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DeviceOrientation,
  DeviceOrientationCompassHeading
} from '@ionic-native/device-orientation/ngx';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { TransformationType, Direction } from 'angular-coordinates';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  previousAngle = 0;
  newAngle = 0;
  direction = Direction;
  bearingAngle: any = 0;
  type = TransformationType;
  compassDegree: number;
  cardinalPosition: string;
  magneticHeading: any = 0;
  latCoords: number = 0;
  lngCoords: number = 0;
  destLat: number = 0.1521;
  destLong: number = 37.3084;
  deviceSubscription: Subscription;


  constructor(
    private deviceOrientation: DeviceOrientation,
    private platform: Platform,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.deviceLocation();
    });
  }

  ngOnDestroy() {
    this.deviceSubscription.unsubscribe();
  }


  angleFromCoordinate() {
    let lat1 = this.latCoords
    let lon1 = this.lngCoords
    let lat2 = this.destLat;
    let lon2 = this.destLong;
    let p1 = {
      x: lat1,
      y: lon1
    };
    let p2 = {
      x: lat2,
      y: lon2
    };
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    this.bearingAngle = angleDeg;
    return angleDeg;
  }

  deviceCompassInfo() {
    this.deviceOrientation.getCurrentHeading().then(
      (data: DeviceOrientationCompassHeading) => {
        this.magneticHeading = data.magneticHeading;
        this.rotateCompass(data.magneticHeading);
        this.rotateTriangle(this.angleFromCoordinate(), data.magneticHeading);
        this.compassDegree = Math.floor(data.magneticHeading);
        this.cardinalPosition = this.getCardinal(this.compassDegree);
      },
      (error: any) => console.log(error)
    );

    this.deviceSubscription = this.deviceOrientation.watchHeading().subscribe(
      (data: DeviceOrientationCompassHeading) => {
        this.magneticHeading = data.magneticHeading;
        this.rotateCompass(data.magneticHeading);
        this.rotateTriangle(this.angleFromCoordinate(), data.magneticHeading);
        this.compassDegree = Math.floor(data.magneticHeading);
        this.cardinalPosition = this.getCardinal(this.compassDegree);
      }
    );
  }

  deviceLocation() {
    this.http.get('https://geoip-db.com/json/')
      .subscribe((data: any) => {
        this.latCoords = data.latitude;
        this.lngCoords = data.longitude;
        this.rotateTriangle(this.angleFromCoordinate(), 90);
        this.deviceCompassInfo();
      },
        (err) => console.log('err getting location ', err));
  }

  rotateCompass(deg) {
    (<HTMLElement>document.querySelector('#image')).style.transform = `rotate(${-deg}deg)`;
  }

  rotateTriangle(deg, deg2) {
    // console.log('deg1   ', deg, 'deg2   ', deg2);
    let prev = -(deg) + 90;
    let _deg = -(deg) + 90 + (deg2);
    this.previousAngle = prev;
    this.newAngle = _deg;
    (<HTMLElement>document.querySelector('#triangle')).style.transform = `rotate(${-_deg}deg)`;
  }

  getCardinal(angle) {
    const directions = 8;
    const degree = 360 / directions;
    angle = angle + degree / 2;

    if (angle >= 0 * degree && angle < 1 * degree) {
      return 'N';
    }
    if (angle >= 1 * degree && angle < 2 * degree) {
      return 'NE';
    }
    if (angle >= 2 * degree && angle < 3 * degree) {
      return 'E';
    }
    if (angle >= 3 * degree && angle < 4 * degree) {
      return 'SE';
    }
    if (angle >= 4 * degree && angle < 5 * degree) {
      return 'S';
    }
    if (angle >= 5 * degree && angle < 6 * degree) {
      return 'SW';
    }
    if (angle >= 6 * degree && angle < 7 * degree) {
      return 'W';
    }
    if (angle >= 7 * degree && angle < 8 * degree) {
      return 'NW';
    }

    return 'N';
  }

}
