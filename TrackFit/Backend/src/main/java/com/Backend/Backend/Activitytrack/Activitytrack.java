package com.Backend.Backend.Activitytrack;
import com.Backend.Backend.Activity.Activity;
import jakarta.persistence.*;

@Entity
@Table
public class Activitytrack {
    @Id
    @SequenceGenerator(
            name="activitytrack_sequence",
            sequenceName="activitytrack_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "activitytrack_sequence"
    )

    private Long activityid;
    private String username;
    private String activityname;
    private String activitytype;
    @Column(columnDefinition = "LONGTEXT")
    private String activitytrackJson;
    private String visibility;

    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;


    public Activitytrack(Long activityid, String activitytrackJson, String username, String activityname, String activitytype, String visibility) {
        this.activityid = activityid;
        this.activitytrackJson = activitytrackJson;
        this.username = username;
        this.activityname = activityname;
        this.activitytype = activitytype;
        this.visibility = visibility;
    }

    public Activitytrack() {

    }

    public Activity getActivity() {
        return activity;
    }
    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public Long getId() {
        return activityid;
    }

    public void setId(Long activityid) {
        this.activityid = activityid;
    }

    public String getActivitytrackJson() {
        return activitytrackJson;
    }

    public void setActivitytrackJson(String activitytrackJson) {
        this.activitytrackJson = activitytrackJson;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getActivitytype() {
        return activitytype;
    }

    public void setActivitytype(String activitytype) {
        this.activitytype = activitytype;
    }

    public String getActivityname() {
        return activityname;
    }

    public void setActivityname(String activityname) {
        this.activityname = activityname;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "Activitytrack{" +
                "id=" + activityid +
                ", username='" + username + '\'' +
                ", activityname='" + activityname + '\'' +
                ", activitytype='" + activitytype + '\'' +
                ", activitytrackJson='" + activitytrackJson + '\'' +
                ", visibility='" + visibility + '\'' +
                '}';
    }
}
