package ru.vkr.stockanalyzer.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import ru.vkr.stockanalyzer.dto.compare.StockCompareItemDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerFilterDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerPageDto;
import ru.vkr.stockanalyzer.dto.screener.ScreenerResultDto;
import ru.vkr.stockanalyzer.dto.stock.AnalysisDto;
import ru.vkr.stockanalyzer.exception.StockNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MlClient {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlUrl;

    public AnalysisDto getAnalysis(String ticker) {
        String url = mlUrl + "/analysis/" + ticker;
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new StockNotFoundException("Нет данных для: " + ticker);
            return mapToAnalysisDto(response);
        } catch (StockNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new StockNotFoundException("Ошибка получения анализа для: " + ticker);
        }
    }

    public StockCompareItemDto getCompareItem(String ticker) {
        String url = mlUrl + "/analysis/" + ticker;
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new StockNotFoundException("Нет данных для: " + ticker);
            return mapToCompareItem(response);
        } catch (StockNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new StockNotFoundException("Ошибка получения данных для: " + ticker);
        }
    }

    private AnalysisDto mapToAnalysisDto(Map<String, Object> data) {
        Map<String, Object> technical   = (Map<String, Object>) data.get("technical");
        Map<String, Object> fundamental = (Map<String, Object>) data.get("fundamental");
        Map<String, Object> consensus   = (Map<String, Object>) data.get("consensus");
        Map<String, Object> raw         = fundamental != null ?
                (Map<String, Object>) fundamental.get("raw") : null;

        return AnalysisDto.builder()
                .ticker((String) data.get("ticker"))
                .currentPrice(toDouble(data.get("current_price")))
                .lastDate((String) data.get("last_date"))
                .signal3d(mapSignal((Map<String, Object>) technical.get("3d")))
                .signal5d(mapSignal((Map<String, Object>) technical.get("5d")))
                .signal10d(mapSignal((Map<String, Object>) technical.get("10d")))
                .signal30d(mapSignal((Map<String, Object>) technical.get("30d")))
                .grahamScore(toDouble(fundamental != null ? fundamental.get("score") : null))
                .grahamInterpretation(fundamental != null ? (String) fundamental.get("interpretation") : null)
                .consensusRecommendation(consensus != null ? (String) consensus.get("recommendation") : null)
                .targetPrice(consensus != null ? toDouble(consensus.get("target_price")) : null)
                .peRatio(raw != null ? toDouble(raw.get("pe_ratio")) : null)
                .pbRatio(raw != null ? toDouble(raw.get("pb_ratio")) : null)
                .roe(raw != null ? toDouble(raw.get("roe")) : null)
                .roa(raw != null ? toDouble(raw.get("roa")) : null)
                .netMargin(raw != null ? toDouble(raw.get("net_margin")) : null)
                .debtToEquity(raw != null ? toDouble(raw.get("debt_to_equity")) : null)
                .divYield(raw != null ? toDouble(raw.get("div_yield")) : null)
                .build();
    }

    private StockCompareItemDto mapToCompareItem(Map<String, Object> data) {
        Map<String, Object> technical   = (Map<String, Object>) data.get("technical");
        Map<String, Object> fundamental = (Map<String, Object>) data.get("fundamental");
        Map<String, Object> raw         = fundamental != null ?
                (Map<String, Object>) fundamental.get("raw") : null;

        return StockCompareItemDto.builder()
                .ticker((String) data.get("ticker"))
                .currentPrice(toDouble(data.get("current_price")))
                .signal10d(mapSignal(technical != null ?
                        (Map<String, Object>) technical.get("10d") : null))
                .grahamScore(toDouble(fundamental != null ? fundamental.get("score") : null))
                .grahamInterpretation(fundamental != null ?
                        (String) fundamental.get("interpretation") : null)
                .peRatio(raw != null ? toDouble(raw.get("pe_ratio")) : null)
                .pbRatio(raw != null ? toDouble(raw.get("pb_ratio")) : null)
                .roe(raw != null ? toDouble(raw.get("roe")) : null)
                .divYield(raw != null ? toDouble(raw.get("div_yield")) : null)
                .debtToEquity(raw != null ? toDouble(raw.get("debt_to_equity")) : null)
                .build();
    }

    private ScreenerResultDto mapToScreenerResult(Map<String, Object> data) {
        Map<String, Object> fundamental = (Map<String, Object>) data.get("fundamental");
        Map<String, Object> raw         = fundamental != null ?
                (Map<String, Object>) fundamental.get("raw") : null;

        return ScreenerResultDto.builder()
                .ticker((String) data.get("ticker"))
                .name((String) data.get("name"))
                .currentPrice(toDouble(data.get("current_price")))
                .grahamScore(toDouble(fundamental != null ? fundamental.get("score") : null))
                .interpretation(fundamental != null ? (String) fundamental.get("interpretation") : null)
                .peRatio(raw != null ? toDouble(raw.get("pe_ratio")) : null)
                .divYield(raw != null ? toDouble(raw.get("div_yield")) : null)
                .build();
    }

    private String mapSignal(Map<String, Object> signal) {
        if (signal == null) return null;
        Object s = signal.get("signal");
        Object c = signal.get("confidence");
        int direction      = s instanceof Integer ? (Integer) s : ((Number) s).intValue();
        double confidence  = c instanceof Double ? (Double) c : ((Number) c).doubleValue();
        return (direction == 1 ? "вверх" : "вниз") + " " + Math.round(confidence * 100) + "%";
    }

    private Double toDouble(Object val) {
        if (val == null) return null;
        if (val instanceof Double d)  return d;
        if (val instanceof Integer i) return i.doubleValue();
        if (val instanceof Float f)   return f.doubleValue();
        if (val instanceof Long l)    return l.doubleValue();
        return null;
    }

    public ScreenerPageDto screen(ScreenerFilterDto filter) {
        StringBuilder url = new StringBuilder(mlUrl + "/screener?");
        if (filter.getSector() != null) url.append("sector=").append(filter.getSector()).append("&");
        if (filter.getPeMax() != null)  url.append("pe_max=").append(filter.getPeMax()).append("&");
        if (filter.getDivMin() != null) url.append("div_min=").append(filter.getDivMin()).append("&");
        if (filter.getSort() != null)   url.append("sort=").append(filter.getSort()).append("&");
        url.append("page=").append(filter.getPage()).append("&");
        url.append("size=").append(filter.getSize());

        try {
            Map<String, Object> response = restTemplate.getForObject(url.toString(), Map.class);
            if (response == null) return ScreenerPageDto.builder().results(new ArrayList<>()).build();

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("results");
            List<ScreenerResultDto> results = items != null ?
                    items.stream().map(this::mapToScreenerResult).toList() :
                    new ArrayList<>();

            return ScreenerPageDto.builder()
                    .total((Integer) response.getOrDefault("total", 0))
                    .page((Integer) response.getOrDefault("page", 0))
                    .size((Integer) response.getOrDefault("size", 20))
                    .results(results)
                    .build();
        } catch (Exception e) {
            return ScreenerPageDto.builder().results(new ArrayList<>()).build();
        }
    }
}