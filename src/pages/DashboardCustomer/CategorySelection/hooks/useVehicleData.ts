import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VinSearchService, VinDetailData } from '@/services/vinSearchService';
import { getIdUsers } from '@/helpers/generalHelper';

interface UseVehicleDataResult {
  vehicleData: VinDetailData | null;
  productId: string;
  loading: boolean;
  error: string | null;
}

export const useVehicleData = (vinId?: string): UseVehicleDataResult => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState<VinDetailData | null>(null);
  const [productId, setProductId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!vinId) {
        toast.error('VIN number is required');
        navigate('/search-vin');
        return;
      }

      const customerId = getIdUsers();
      if (!customerId) {
        toast.error('User not authenticated');
        navigate('/search-vin');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await VinSearchService.getVinDetail(vinId, customerId);

        if (response.data.success) {
          setVehicleData(response.data.data);
          setProductId(response.data.data.data_vin.product_id);
        } else {
          const errMsg = response.data.message || 'Vehicle not found';
          setError(errMsg);
          toast.error(errMsg);
          navigate('/search-vin');
        }
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
        const errMsg = 'Failed to load vehicle information';
        setError(errMsg);
        toast.error(errMsg);
        navigate('/search-vin');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [vinId, navigate]);

  return { vehicleData, productId, loading, error };
};
