# ml-service/app/estimator/service.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from typing import Dict
import warnings

warnings.filterwarnings('ignore')

# ResearchBasedSustainabilityEstimator class for estimating sustainability impact of clothing swaps
class ResearchBasedSustainabilityEstimator:
    """
    Research-backed sustainability impact calculator for clothing swaps
    Built using authoritative LCA data from Higg MSI, Quantis, WRAP, and other sources,
    with a special focus on Indian brands and apparel.
    """

    def __init__(self):
        self.lca_database = self._initialize_research_based_database()
        self.ml_models = {}
        self.encoders = {}
        self.scaler = StandardScaler()
        self.is_trained = False
        self.data_sources = self._get_data_sources()
        # Define feature columns here to be accessible by ML methods
        self.feature_cols = ['item_type_encoded', 'material_encoded', 'brand_encoded', 'condition_encoded', 'weight_kg', 'manufacturing_multiplier', 'brand_multiplier', 'condition_multiplier', 'weight_material_interaction', 'brand_condition_interaction']


    def _get_data_sources(self) -> Dict:
        """Document all data sources used for transparency"""
        return {
            "higg_msi": {"name": "Higg Materials Sustainability Index (MSI)", "year": "2023"},
            "quantis_2018": {"name": "Quantis - Measuring Fashion Environmental Impact", "year": "2018"},
            "wrap_uk": {"name": "WRAP UK - Valuing Our Clothes", "year": "2017"},
            "kering_epl": {"name": "Kering Environmental P&L", "year": "2022"},
            "indian_textile_lca": {"name": "Various Reports on Indian Textile Industry & Brands", "year": "2020-2024"}
        }

    def _initialize_research_based_database(self) -> pd.DataFrame:
        """Initialize LCA database using real research data with citations"""
        higg_materials = {
            'Cotton': {'co2_per_kg': 16.0, 'water_per_kg': 13500, 'source': 'Higg MSI 2023'},
            'Organic_Cotton': {'co2_per_kg': 12.5, 'water_per_kg': 9000, 'source': 'Higg MSI 2023'},
            'Polyester': {'co2_per_kg': 15.6, 'water_per_kg': 390, 'source': 'Higg MSI 2023'},
            'Recycled_Polyester': {'co2_per_kg': 8.2, 'water_per_kg': 280, 'source': 'Higg MSI 2023'},
            'Wool': {'co2_per_kg': 56.5, 'water_per_kg': 7500, 'source': 'Higg MSI 2023'},
            'Linen': {'co2_per_kg': 9.5, 'water_per_kg': 2500, 'source': 'Higg MSI 2023'},
            'Silk': {'co2_per_kg': 27.3, 'water_per_kg': 10000, 'source': 'Kering EPL 2022'},
            'Viscose': {'co2_per_kg': 15.2, 'water_per_kg': 3000, 'source': 'Higg MSI 2023'},
            'Leather': {'co2_per_kg': 110.0, 'water_per_kg': 17000, 'source': 'Kering EPL 2022'},
            'Denim': {'co2_per_kg': 23.2, 'water_per_kg': 10850, 'source': 'Quantis 2018'},
            'Khadi': {'co2_per_kg': 5.0, 'water_per_kg': 4000, 'source': 'Estimated based on hand-spun/woven characteristics'},
        }
        garment_specs = {
            'T-shirt': {'weight_kg': 0.18, 'manufacturing_multiplier': 1.4, 'source': 'Quantis 2018'},
            'Jeans': {'weight_kg': 0.68, 'manufacturing_multiplier': 2.8, 'source': 'Quantis 2018'},
            'Hoodie': {'weight_kg': 0.58, 'manufacturing_multiplier': 1.6, 'source': 'Quantis 2018'},
            'Kurta_Kurti': {'weight_kg': 0.30, 'manufacturing_multiplier': 1.6, 'source': 'Estimated for Indian apparel'},
            'Saree': {'weight_kg': 0.80, 'manufacturing_multiplier': 1.5, 'source': 'Estimated for Indian apparel'},
        }
        brand_multipliers = {
            'Aditya_Birla_Fashion_Retail': 0.82, 'Pantaloons': 0.82, 'Allen_Solly': 0.82, 'Van_Heusen': 0.82,
            'Westside': 0.88, 'Zudio': 0.92, 'LifeStyle': 0.90, 'Fabindia': 0.75, 'Reebok': 0.84, 'HRX': 0.85,
            'Patagonia': 0.65, 'H&M': 0.90, 'Zara': 0.92, 'Levi': 0.84, 'Nike': 0.82, 'Adidas': 0.80, 'Shein': 1.35, 'Unknown': 1.00,
        }
        condition_multipliers = {
            'New': 1.00, 'Like_New': 0.08, 'Excellent': 0.12, 'Good': 0.18, 'Fair': 0.28, 'Poor': 0.45,
        }
        lca_data = []
        for item_type, item_specs in garment_specs.items():
            for material, material_data in higg_materials.items():
                for brand, brand_mult in brand_multipliers.items():
                    for condition, condition_mult in condition_multipliers.items():
                        weight = item_specs['weight_kg']
                        manufacturing_mult = item_specs['manufacturing_multiplier']
                        base_co2 = material_data['co2_per_kg'] * weight * manufacturing_mult
                        base_water = material_data['water_per_kg'] * weight * manufacturing_mult
                        base_waste = weight * 0.15
                        final_co2 = base_co2 * brand_mult * condition_mult
                        final_water = base_water * brand_mult * condition_mult
                        final_waste = base_waste * brand_mult * condition_mult
                        lca_data.append({
                            'item_type': item_type, 'material': material, 'brand': brand, 'condition': condition,
                            'weight_kg': weight, 'co2_kg': round(max(0.01, final_co2), 3),
                            'water_l': round(max(1, final_water), 0), 'waste_kg': round(max(0.001, final_waste), 4),
                            'manufacturing_multiplier': manufacturing_mult, 'brand_multiplier': brand_mult,
                            'condition_multiplier': condition_mult
                        })
        return pd.DataFrame(lca_data)

    def train_ml_models(self, test_size: float = 0.2, random_state: int = 42):
        print("Training ML models on research-based data...")
        df = self.lca_database.copy()
        categorical_features = ['item_type', 'material', 'brand', 'condition']
        for feature in categorical_features:
            le = LabelEncoder()
            df[f'{feature}_encoded'] = le.fit_transform(df[feature])
            self.encoders[feature] = le
        df['weight_material_interaction'] = df['weight_kg'] * df['material_encoded']
        df['brand_condition_interaction'] = df['brand_encoded'] * df['condition_encoded']
        X = df[self.feature_cols]
        X_scaled = self.scaler.fit_transform(X)
        targets = ['co2_kg', 'water_l', 'waste_kg']
        for target in targets:
            y = df[target]
            X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=test_size, random_state=random_state)
            rf_model = RandomForestRegressor(n_estimators=100, random_state=random_state, n_jobs=-1)
            rf_model.fit(X_train, y_train)
            self.ml_models[target] = rf_model
        self.is_trained = True
        print("ML models trained successfully!")

    def get_ml_estimate(self, item_type: str, material: str, brand: str, condition: str, **kwargs) -> Dict:
        if not self.is_trained:
            raise ValueError("Models not trained. Call train_ml_models() first.")
        weight_kg = self.lca_database[self.lca_database['item_type'] == item_type]['weight_kg'].median()
        encoded_features = {}
        for feature in ['item_type', 'material', 'brand', 'condition']:
            le = self.encoders[feature]
            value_to_encode = locals()[feature]
            if value_to_encode not in le.classes_:
                value_to_encode = 'Unknown' if 'Unknown' in le.classes_ else le.classes_[0]
            encoded_features[f'{feature}_encoded'] = le.transform([value_to_encode])[0]
        brand_mult = self.lca_database[self.lca_database['brand'] == brand]['brand_multiplier'].mean()
        condition_mult = self.lca_database[self.lca_database['condition'] == condition]['condition_multiplier'].mean()
        manufacturing_mult = self.lca_database[self.lca_database['item_type'] == item_type]['manufacturing_multiplier'].mean()
        features_dict = {
            **encoded_features, 'weight_kg': weight_kg,
            'manufacturing_multiplier': manufacturing_mult, 'brand_multiplier': brand_mult,
            'condition_multiplier': condition_mult,
            'weight_material_interaction': weight_kg * encoded_features['material_encoded'],
            'brand_condition_interaction': encoded_features['brand_encoded'] * encoded_features['condition_encoded']
        }
        features_df = pd.DataFrame([features_dict])[self.feature_cols]
        scaled_features = self.scaler.transform(features_df)
        predictions = {}
        for target, model in self.ml_models.items():
            pred = model.predict(scaled_features)[0]
            predictions[f'{target.replace("_kg", "_saved_kg").replace("_l", "_saved_l")}'] = round(max(0, pred), 3)
        return {"method": "ml_prediction", **predictions}