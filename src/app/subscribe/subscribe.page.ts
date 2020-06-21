import {Component, OnInit} from '@angular/core';
import {SubscriptionService} from '../services/subscribe/subscription.service';
import {Location, Price, Subscription} from '../model/Subscription';
import {PaymentService} from '../services/payment/payment.service';
import {GeoService} from '../services/geo/geo.service';
import {RecyclingMapService} from '../services/recycling-map/recycling-map.service';
import {filter, flatMap, map, switchMap, tap} from 'rxjs/operators';
import {from} from 'rxjs';
import {MathService} from '../services/math/math.service';

@Component({
    selector: 'app-subscribe',
    templateUrl: './subscribe.page.html',
    styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage implements OnInit {
    subscription: Subscription;
    price: Price;
    locations: Location[] = [];
    places: any[];
    is_in_search_edit_mode = false;

    constructor(private subscriptionService: SubscriptionService,
                private paymentService: PaymentService,
                private geoApi: GeoService,
                private recyclingMapService: RecyclingMapService,
                private mathService: MathService) {
    }

    ngOnInit() {
        this.places = [];
        this.subscription = this.subscriptionService.create();
        this.recalc();
    }

    public recalc() {
        this.findSammelstellen();
        this.paymentService.calculatePrice(this.subscription);
    }


    public findLocation($event) {
        if (!this.is_in_search_edit_mode) {
            return;
        }
        this.locations = [];
        if ($event.detail.value.trim() === '') {
            return;
        }
        this.geoApi.findLocation($event.detail.value.trim()).subscribe(
            (res) => {
                this.locations = res;
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public removeLocations($event) {
        this.locations = [];
        this.places = [];
    }

    public setIs_in_search_edit_mode(value: boolean) {
        this.is_in_search_edit_mode = value;
    }

    public jumpToLocation(location: Location) {
        console.log('location', location);
        this.setIs_in_search_edit_mode(false);
        this.locations = [];
        this.subscription.address_canonical = location.address_canonical;
        this.geoApi.identify(location).subscribe((res) => {
                res.filter(r => r.layerBodId === 'ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill')
                    .forEach(r => {
                        this.subscription.gdekt = r.properties.kanton;
                        this.subscription.gdname = r.properties.gemname;
                        this.subscription.gdid = r.id;
                    });
                res.filter(r => r.layerBodId === 'ch.swisstopo-vd.ortschaftenverzeichnis_plz')
                    .forEach(r => {
                        this.subscription.plz4 = '' + r.properties.plz;
                        this.subscription.plzname = r.properties.langtext;
                        console.log('plzname', this.subscription.plzname);
                        this.subscription.is_address_identified = true;
                    });
            },
            (err) => {
                this.subscription.is_address_identified = false;
            },
            () => {
                this.findSammelstellen();
            }
        );
    }

    private findSammelstellen() {
        const selectedJobs = this.subscription.jobs.filter(j => j.is_selected);
        selectedJobs.forEach(j => {
            this.recyclingMapService.findPlaces(this.subscription.plz4);
        });
        this.places = [];
        this.subscription.total_saved_co2_per_year = 0;
        this.subscription.total_saved_fuel_per_year_in_liter = 0;
        const materialsMatcher = (materials: []) => {
            const jbs = this.subscription.jobs.filter(j => j.is_selected)
                .filter(j => materials.find((m: any) => m.id === j.material_id.valueOf()) !== undefined);
            return jbs.length > 0;
        };
        this.recyclingMapService.findPlaces(this.subscription.plz4)
            .pipe(switchMap((res: any[]) => from(res)),
                filter(res => materialsMatcher(res.materials)))
            .subscribe((res: any) => {
                    this.places.push(res);
                },
                (err) => console.error(err),
                () => {
                    this.places.forEach(p => {
                        this.recyclingMapService.calculateRoutes(p.full_name + ', ' + p.city.zip + ' ' + p.city.name,
                            this.subscription.address_canonical)
                            .subscribe(
                                (route: any) => {
                                    p.distance_in_km = route.route.rawdistance / 1000;
                                    p.co2_exhaust_in_kg = p.distance_in_km * 0.185;
                                    p.match_count = 0;
                                },
                                (err) => {
                                    console.error('calculateRoutes', err);
                                },
                                () => {
                                    this.places = this.places.sort((a, b) => {
                                        if (a.distance_in_km > b.distance_in_km) {
                                            return 1;
                                        }
                                        if (a.distance_in_km < b.distance_in_km) {
                                            return -1;
                                        }
                                        return 0;
                                    });
                                    if (this.places.length > 5) {
                                        this.places = this.places.slice(0, 5);
                                    }
                                    if (this.places.length > 0) {
                                        this.subscription.total_saved_km_per_year = (52 / 2) * 2 * this.places[0].distance_in_km;
                                        this.subscription.total_saved_co2_per_year = (52 / 2) * 2 * this.places[0].co2_exhaust_in_kg;
                                        this.subscription.total_saved_fuel_per_year_in_liter = this.subscription.total_saved_km_per_year * (8 / 100);
                                        this.subscription.total_saved_fuel_per_year_in_fr = this.subscription.total_saved_fuel_per_year_in_liter * 1.38;
                                    }
                                }
                            );
                    });
                    // this.subscription.jobs.filter(j => j.is_selected).filter(j => j.material_id.valueOf() === 99).forEach(j => {
                    //   this.recyclingMapService.findSammelsackPlaces(this.subscription.plz4, this.subscription.gdekt).subscribe(
                    //       (res2: any) => {
                    //         this.places.push(res2.full_name);
                    //       }
                    //   );
                    // });
                });

    }

    setWeight(weight) {
        setTimeout(() => {
            this.subscription.estimated_weight_in_kg = weight;
            this.recalc();
        }, 450);
    }

    setWeekday(weekday) {
        setTimeout(() => {
            this.subscription.interval.repeat_weekday_number = weekday;
            //this.recalc();
        }, 450);
    }

    setDayHour(hr) {
        setTimeout(() => {
            this.subscription.interval.repeat_dayhour_number = hr;
            // this.recalc();
        }, 450);
    }

    setRepeatWeeks(w) {
        setTimeout(() => {
            this.subscription.interval.repeat_weeks = w;
            this.recalc();
        }, 450);
    }

}
