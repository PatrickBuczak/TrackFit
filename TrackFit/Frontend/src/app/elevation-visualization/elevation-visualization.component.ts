import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import {
  ChartEvent,
  ActiveElement,
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-elevation-visualization',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './elevation-visualization.component.html',
  styleUrls: ['./elevation-visualization.component.scss'],
})
export class ElevationVisualizationComponent implements AfterViewInit {
  activityId: number | null = null;
  activityName: string = '';
  activityDate: string = '';
  activityType: string = '';
  altitudeMeters: number = 0;
  averageSpeedKmh: number = 0;
  calorieConsumoption: number = 0;
  totalDistanceMet: number = 0;
  totalDurationMin: number = 0;
  chart: any; // Chart-Instanz
  likesCount: number = 0; // Anzahl der Likes


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private router: Router
  ) {}

  logedusername: string | null = '';
  jwttoken: boolean = true;

  ngOnInit(): void {
    this.logedusername = sessionStorage.getItem('username');
    // Registriere Chart.js-Komponenten
    Chart.register(
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Title,
      Tooltip
    );

    // Hole die Aktivitäts-ID aus der URL
    this.activityId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit(): void {
    // Sicherstellen, dass das Diagramm erst nach DOM-Rendern initialisiert wird
    setTimeout(() => {
      if (this.activityId) {
        this.loadElevationData(this.activityId!); //Elevationdaten laden
        this.loadActivityDetails(this.activityId!); // Aktivitätsdetails laden
      }
    }, 0);
  }

// Methode zum Laden der Elevationsdaten aus dem Backend
  loadElevationData(activityId: number): void {
    const url = `http://localhost:8080/api/v1/activitytrack/${activityId}/elevationdata`;
    this.http.get<{ time: string; elevation: number }[]>(url).subscribe({
      next: (data) => {
        console.log('Erhaltene Daten:', data);

        const timestamps = data.map((point) => {
          const date = new Date(point.time);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        });

        const elevations = data.map((point) => point.elevation);
        this.renderChart(timestamps, elevations);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Elevationsdaten:', error);
      },
      complete: () => {
        console.log('Daten erfolgreich geladen und verarbeitet.');
      }
    });
  }

  // Methode zum Laden der Aktivitätsinformationen aus dem Backend
  loadActivityDetails(activityId: number): void {
    const url = `http://localhost:8080/api/v1/activity/${activityId}`;
    this.http.get<{
      activityname: string;
      activitytype: string;
      activitydate: string;
      altitudemeters: number;
      averagespeedkmh: number;
      calorieconsumoption: number;
      totaldistanceMet: number;
      totaldurationMin: number;
    }>(url).subscribe({
      next: (activity) => {
        this.activityName = activity.activityname;
        this.activityType = activity.activitytype;
        this.activityDate = this.formatDate(activity.activitydate);
        this.altitudeMeters = activity.altitudemeters;
        this.averageSpeedKmh = activity.averagespeedkmh;
        this.calorieConsumoption = activity.calorieconsumoption;
        this.totalDistanceMet = activity.totaldistanceMet;
        this.totalDurationMin = activity.totaldurationMin;

        // Lade die Likes
        this.loadLikes(activityId);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Aktivitätsdetails:', error);
      },
      complete: () => {
        console.log('Aktivitätsdetails erfolgreich geladen.');
      },
    });
  }

  loadLikes(activityId: number): void {
    // URL zum Abrufen der Likes für eine spezifische Aktivität
    const likesUrl = `http://localhost:8080/api/v1/activity/${activityId}/likes`;

    // HTTP GET-Anfrage, um die Liste der Benutzer abzurufen, die die Aktivität geliked haben
    this.http.get<string[]>(likesUrl).subscribe({
      // Erfolgreicher Abruf der Likes
      next: (likes) => {
        this.likesCount = likes.length; // Speichere die Anzahl der Likes
      },
      // Fehlerbehandlung, falls die Anfrage fehlschlägt
      error: (error) => {
        console.error(`Fehler beim Laden der Likes für Aktivität ${activityId}:`, error);
      },
      // Abschlussmeldung nach erfolgreicher oder fehlgeschlagener Anfrage
      complete: () => {
        console.log('Likes erfolgreich geladen.');
      },
    });
  }

  // Diagramm mit Chart.js rendern
  renderChart(timestamps: string[], elevations: number[]): void {
    const ctx = document.getElementById('elevationChart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy(); // Alte Instanz entfernen
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'Höhe (m)',
            data: elevations,
            borderColor: '#EE6F00',
            backgroundColor: 'rgba(238, 111, 0, 0.1)',
            borderWidth: 4,
            tension: 0.8,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#FFFFFF',
            pointHoverBorderColor: '#EE6F00',
            pointHoverBorderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: false,
          },
        },
        onHover: (event: ChartEvent, elements: ActiveElement[]) => {
          const tooltipElement = document.getElementById('custom-tooltip');
          const mouseEvent = event.native as MouseEvent | null;

          if (elements.length > 0 && tooltipElement && mouseEvent) {
            const elementIndex = elements[0].index;

            // Werte extrahieren
            const dataValue = elevations[elementIndex];
            const timestamp = timestamps[elementIndex];

            // Name + Datum
            tooltipElement.querySelector('.tooltip-activity-name')!.textContent = this.activityName;
            tooltipElement.querySelector('.tooltip-activity-date')!.textContent = `am ${this.activityDate}`;

            // Statistiken der angezeigten Aktivität
            const columns = tooltipElement.querySelectorAll('.tooltip-row:nth-child(2) .tooltip-column');
            columns[0].querySelectorAll('.tooltip-value')[0]!.textContent = this.activityType;
            columns[0].querySelectorAll('.tooltip-value')[1]!.textContent = `${this.averageSpeedKmh.toFixed(2)} km/h`;
            // Hinweis: totalDurationMin speichert die Werte in Sekunden, deswegen /3600 statt /60 da Anzeige in h
            columns[1].querySelectorAll('.tooltip-value')[0]!.textContent = `${(this.totalDurationMin / 3600).toFixed(2)} h`;
            columns[1].querySelectorAll('.tooltip-value')[1]!.textContent = `${this.altitudeMeters.toFixed(2)} m`;
            // Hinweis: Anzeige in h, deswegen /1000
            columns[2].querySelectorAll('.tooltip-value')[0]!.textContent = `${(this.totalDistanceMet / 1000).toFixed(2)} km`;
            columns[2].querySelectorAll('.tooltip-value')[1]!.textContent = `${this.calorieConsumoption} kcal`;

            // "Live" Graphwerte Zeit - Höhenmeter
            const bottomColumns = tooltipElement.querySelectorAll('.tooltip-row:nth-child(3) .tooltip-column');
            bottomColumns[0].querySelector('.tooltip-value')!.textContent = timestamp;
            bottomColumns[1].querySelector('.tooltip-value')!.textContent = `${dataValue.toFixed(2)} m`;

            // Tooltip anzeigen und positionieren
            tooltipElement.style.opacity = '1';
            tooltipElement.style.display = 'block';

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left = mouseEvent.clientX - 424; // Abstand des Tooltips zum Mauszeiger X-Achse
            let top = mouseEvent.clientY - 180; // Abstand des Tooltips zum Mauszeiger Y-Achse

            if (left + tooltipElement.offsetWidth > viewportWidth) {
              left = viewportWidth - tooltipElement.offsetWidth - 10;
            }
            if (top + tooltipElement.offsetHeight > viewportHeight) {
              top = viewportHeight - tooltipElement.offsetHeight - 10;
            }

            tooltipElement.style.left = `${left}px`;
            tooltipElement.style.top = `${top}px`;
          } else if (tooltipElement) {
            tooltipElement.style.opacity = '0';
            tooltipElement.style.display = 'none';
          }
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Zeit',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Höhe (m)',
            },
            beginAtZero: false,
          },
        },
      },
    });

    // zum Ausblenden des Tooltips bei Verlassen des Graphen
    ctx.addEventListener('mouseleave', () => {
      const tooltipElement = document.getElementById('custom-tooltip');
      if (tooltipElement) {
        tooltipElement.style.opacity = '0';
        tooltipElement.style.display = 'none';
      }
    });

    console.log('Chart initialized with hoverable points and custom tooltip:', this.chart);
  }

// Methode zum Umwandeln des Datumformats
  formatDate(dateString: string): string {
    // Datum im Format dd.mm.yyyy umwandeln
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }


// ALTE FUNKTIONEN WIE JWT TOKEN CHECK UND RETURN-BUTTON

  // --- RETURN BUTTON FUNKTION ---
  // editiert, um nicht auf eine feste URL zurückzugehen, sondern mittels location auf die zuvor aufgerufene URL---
  navrole: boolean = false; // Variable zur Speicherung der Benutzerrolle: true = regulär, false = Admin
  backnavigate() {
    // Prüfen, ob die letzte Route in der History existiert
    if (window.history.length > 1) {
      this.location.back(); // Zurück zur vorherigen Seite
    } else {
      // Fallback-Logik basierend auf Benutzerrolle
      this.http.get<boolean>(`http://localhost:8080/api/v1/user/get-role?username=${this.logedusername}`).subscribe({
        next: (role) => {
          this.navrole = role;
          console.log('Role updated:', this.navrole);

          const targetRoute = this.navrole ? '/website' : '/website-admin';
          this.router.navigate([targetRoute]).then(() => {
            console.log(`Navigated to ${targetRoute}`);
          }).catch(err => {
            console.error('Navigation error:', err);
          });
        },
        error: (error) => {
          console.error('Error checking user role', error);
        },
        complete: () => {
          console.log('Role check completed.');
        }
      });
    }
  }

  // --- SESSION CHECK MITTELS JWT-TOKEN-ABGLEICH ---
  checkSession(){
    this.http.get<boolean>(`http://localhost:8080/api/v1/jwttoken/check-jwttoken?username=${this.logedusername}`).subscribe({
        next: (jwttoken) => {
          this.jwttoken = jwttoken;
          console.log('JWTToken:', this.jwttoken);
          if (this.jwttoken) {
            this.http.get<any>(`http://localhost:8080/api/v1/user/get-user?username=${this.logedusername}`).subscribe({
                next: (user) => {// stellt Sicher, dass der User zum Zeitpunkt der Anfrage noch existiert
                  this.http.delete(`http://localhost:8080/api/v1/jwttoken/delete?username=${this.logedusername}`).subscribe({
                      next: () => {
                        console.log('JWTToken erfolgreich gelöscht');
                        // neuer Token mit neuem Zeitstempel
                        this.http.post(`http://localhost:8080/api/v1/jwttoken/generate?username=${this.logedusername}`, {}).subscribe({
                            next: (token) => {
                              console.log('Token wurde generiert und gespeichetr:', token);
                            },
                            error: (error) => {
                              console.error('Error bei der Generierung des token', error);
                            },
                            complete: () =>{
                              console.log('fertig');
                            }
                          }
                        );
                      },
                      error: (error) => {
                        console.error('Error bei der Löschung des JWTToken', error);
                      },
                      complete:() =>{
                        console.log('fertig');
                      }
                    }
                  );
                },
                error: (error) => {
                  console.error('Error bei der Anfrage der Userdaten', error);
                },
                complete: () =>{
                  console.log('fertig');
                }
              }
            );
          } else {
            this.router.navigate(['/']).then(() => {//durch then wird definiert, was gemacht werden soll, wenn die Navigation erfolrgreich war und durch catch wird ein potenzieller Fehler angezeigt.
              console.log('Navigiert zu website-admin');
            }).catch(err => {
              console.error('Navigations error:', err);
            });
            alert('Ihre Sitzung ist bereits abgelaufen! Melden Sie sich erneut an.');
          }
        },
        error: (error) => {
          console.error('Error in checkSession()', error);
        },
        complete: () =>{
          console.log('fertig');
        }
      }
    );
  }

}
