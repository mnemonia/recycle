import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, of} from 'rxjs';
import {Sammelstelle} from '../../model/Subscription';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecyclingMapService {

  constructor(private httpClient: HttpClient) { }

  public findSammelstellen(plz4): Observable<Sammelstelle[]> {
    if (plz4.trim() === '') {
      return of([]);
    }
    const url = 'https://recycling-map.ch/inc/functions.php?execute=collecting_points';
    const data = new FormData();
    data.append('with_municipality', '1');
    data.append('q', plz4)
    data.append('max_city_radius', '1');
    data.append('with_nearest','3');
    data.append('municipality', '');
    data.append('distance', 'false');
    return this.httpClient.post(url, data).pipe(
        map((res: Sammelstelle[]) => res)
    );
  }

  public findSammelsackPlaces(plz4, gbdkt): Observable<Sammelstelle[]> {
    if (gbdkt === 'GL') {
      //return of([{"city":{"id":3534,"zip":"8750","name":"Glarus","file":"https:\/\/www.glarus.ch\/onlineschalter.html\/2872","outdated":"","municipality":{"name":"Glarus","material_regional":"","remote_id":1632}},"id":603011,"full_name":"Bowald Martin (Muldenservice) Landstrasse 59","lat":47.0471,"lng":9.06075,"materials":[{"id":23},{"id":9},{"id":10},{"id":28},{"id":13},{"id":16},{"id":4},{"id":19},{"id":41},{"id":25},{"id":21}],"active":1,"exactness":"-1","inaccurate":false}]);
    }
    return of([]);
  }

  public calculateRoutes(to_address, from_address) {
    if (to_address.trim() === '' || from_address.trim() === '') {
      return of({route:{}});
    }
    from_address = encodeURI(from_address);
    to_address = encodeURI(to_address);
    const url = 'https://map.search.ch/api/getcenter.json?from=' + from_address + '&to=' + to_address + '&mode=car&charset=UTF-8&api=1&api_id=0&lang=de';
    return this.httpClient.get(url);
  }

  public getMigrosGlarus() {
    return {
      "city": {
        "id": 3534,
        "zip": "8750",
        "name": "Glarus",
        "file": "https://www.glarus.ch/onlineschalter.html/2872",
        "outdated": "",
        "municipality": {
          "name": "Glarus",
          "material_regional": "",
          "remote_id": 1632
        }
      },
      "id": 626801,
      "full_name": "Migros MM (Zentrum Glärnisch) Schweizerhofstrasse 6",
      "lat": 47.0407,
      "lng": 9.07089,
      "materials": [
        {
          "id": 9
        },
        {
          "id": 35
        },
        {
          "id": 28
        },
        {
          "id": 1
        },
        {
          "id": 37
        },
        {
          "id": 16
        },
        {
          "id": 30
        },
        {
          "id": 8
        },
        {
          "id": 29
        }
      ],
      "active": 1,
      "exactness": "-1",
      "inaccurate": false
    };

  }

  public getSammelsackGlarus() {
    return  {
      "city": {
        "id": 3534,
        "zip": "8750",
        "name": "Glarus",
        "file": "https://www.glarus.ch/onlineschalter.html/2872",
        "outdated": "",
        "municipality": {
          "name": "Glarus",
          "material_regional": "",
          "remote_id": 1632
        }
      },
      "id": 603011,
      "full_name": "Bowald Martin (Muldenservice) Landstrasse 59",
      "lat": 47.0471,
      "lng": 9.06075,
      "materials": [
        {
          "id": 23
        },
        {
          "id": 9
        },
        {
          "id": 10
        },
        {
          "id": 28
        },
        {
          "id": 13
        },
        {
          "id": 16
        },
        {
          "id": 4
        },
        {
          "id": 19
        },
        {
          "id": 41
        },
        {
          "id": 25
        },
        {
          "id": 21
        }
      ],
      "active": 1,
      "exactness": "1",
      "inaccurate": false
    };
  }

}
