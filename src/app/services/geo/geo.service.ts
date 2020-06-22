import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Location} from '../../model/Subscription';

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private httpClient: HttpClient) { }

  public findLocation(query: string): Observable<any> {
    const url = '//api3.geo.admin.ch/rest/services/api/SearchServer?lang=de&searchText=' + query + '%20GL&origins=address&type=locations&limit=5&sr=2056';
    return this.httpClient.get(url).pipe(
        //tap(res => console.log(res)),
        map((res: any) => res.results),
        map((res: any) => {
          const objs = [];
          res.forEach(r => {
            const o = new Location();
            o.attrs = r.attrs;
            o.address_canonical = r.attrs.label.replace('<b>', '')
                .replace('</b>','')
                .replace('<i>Lokalname swisstopo</i>','')
                .replace('<i>','')
                .replace('</i>','');
            o.is_search_history = false;
            o.result = query;
            objs.push(o);
          });
          return objs;
        })
    );
  }

  public identify(location: Location): Observable<any> {
      const url = 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry=' + location.attrs.y + ',' + location.attrs.x + '&geometryFormat=geojson&geometryType=esriGeometryPoint&lang=de&layers=all:ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill,ch.swisstopo-vd.ortschaftenverzeichnis_plz&limit=10&returnGeometry=false&sr=2056&tolerance=0';
      console.warn('url', url);
      return this.httpClient.get(url).pipe(map( (res: any) => res.results));
  }
}
