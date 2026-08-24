import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const pillSx = {
    borderRadius: 5,
    fontSize: 14,
    "& .MuiSelect-select": { display: "flex", alignItems: "center", py: 0.75, px: 1.5 },
};

function FilterPill({ label, value, onChange, options }) {
    return (
        <Select
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            displayEmpty
            sx={pillSx}
            renderValue={(v) => {
                const selected = options.find((o) => o.value === v);
                const suffix = v !== "all" && selected ? `: ${selected.label}` : "";
                return `${label}${suffix}`;
            }}
        >
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
        </Select>
    );
}

export default FilterPill;
